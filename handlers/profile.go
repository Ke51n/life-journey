package handlers

import (
	"life-journal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var profile models.Profile
	result := models.DB.Where("user_id = ?", userID).First(&profile)
	if result.Error != nil {
		// Create default profile if not exists
		profile = models.Profile{UserID: userID}
		models.DB.Create(&profile)
	}
	c.JSON(http.StatusOK, profile)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var profile models.Profile
	result := models.DB.Where("user_id = ?", userID).First(&profile)
	if result.Error != nil {
		profile = models.Profile{UserID: userID}
	}

	var input models.Profile
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile.Name = input.Name
	profile.Height = input.Height
	profile.Weight = input.Weight
	profile.Zodiac = input.Zodiac
	profile.MBTI = input.MBTI
	profile.Photo = input.Photo

	if result.Error != nil {
		models.DB.Create(&profile)
	} else {
		models.DB.Save(&profile)
	}

	c.JSON(http.StatusOK, profile)
}
