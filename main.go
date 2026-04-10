package main

import (
	"life-journal/config"
	"life-journal/handlers"
	"life-journal/middleware"
	"life-journal/models"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load config
	cfg := config.Load()

	// Initialize database
	if err := models.InitDB(cfg); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Setup Gin
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API routes (must be registered before static files)
	api := r.Group("/api")
	{
		// Auth routes (no auth required)
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthRequired())
		{
			// User
			protected.GET("/auth/me", handlers.GetCurrentUser)

			// Profile
			protected.GET("/profile", handlers.GetProfile)
			protected.PUT("/profile", handlers.UpdateProfile)

			// People
			protected.GET("/people", handlers.GetPeople)
			protected.POST("/people", handlers.CreatePerson)
			protected.PUT("/people/:id", handlers.UpdatePerson)
			protected.DELETE("/people/:id", handlers.DeletePerson)

			// Relationships
			protected.GET("/relationships", handlers.GetRelationships)
			protected.POST("/relationships", handlers.CreateRelationship)
			protected.DELETE("/relationships/:id", handlers.DeleteRelationship)

			// Records
			protected.GET("/records", handlers.GetRecords)
			protected.GET("/records/:id", handlers.GetRecord)
			protected.POST("/records", handlers.CreateRecord)
			protected.PUT("/records/:id", handlers.UpdateRecord)
			protected.DELETE("/records/:id", handlers.DeleteRecord)

			// Logs
			protected.GET("/logs", handlers.GetLogs)
			protected.POST("/logs/undo", handlers.UndoLastAction)
		}
	}

	// Static files - serves frontend assets
	r.Static("/static", "./frontend")
	r.GET("/favicon.ico", func(c *gin.Context) {
		c.Status(204)
	})
	r.GET("/", func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	// Start server
	log.Println("Server starting on :" + cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
