package handlers

import (
	"encoding/json"
	"life-journal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetPeople(c *gin.Context) {
	userID := c.GetUint("user_id")
	var people []models.Person
	models.DB.Where("user_id = ?", userID).Find(&people)
	c.JSON(http.StatusOK, people)
}

func CreatePerson(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input models.Person
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	person := models.Person{
		UserID: userID,
		Name:   input.Name,
		Type:   input.Type,
	}
	models.DB.Create(&person)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "person",
		Action: "create",
		After:  toJSON(person),
	}
	models.DB.Create(&log)

	c.JSON(http.StatusCreated, person)
}

func UpdatePerson(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var person models.Person
	if err := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&person).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "人物不存在"})
		return
	}

	var input models.Person
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	before := toJSON(person)
	person.Name = input.Name
	person.Type = input.Type
	models.DB.Save(&person)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "person",
		Action: "update",
		Before: before,
		After:  toJSON(person),
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, person)
}

func DeletePerson(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var person models.Person
	if err := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&person).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "人物不存在"})
		return
	}

	before := toJSON(person)
	models.DB.Delete(&person)
	// Also delete related relationships
	models.DB.Where("source_id = ? OR target_id = ?", id, id).Delete(&models.Relationship{})

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "person",
		Action: "delete",
		Before: before,
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetRelationships(c *gin.Context) {
	userID := c.GetUint("user_id")
	var relationships []models.Relationship
	models.DB.Where("user_id = ?", userID).Find(&relationships)
	c.JSON(http.StatusOK, relationships)
}

func CreateRelationship(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input models.Relationship
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rel := models.Relationship{
		UserID:   userID,
		SourceID: input.SourceID,
		TargetID: input.TargetID,
		Type:     input.Type,
	}
	models.DB.Create(&rel)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "relationship",
		Action: "create",
		After:  toJSON(rel),
	}
	models.DB.Create(&log)

	c.JSON(http.StatusCreated, rel)
}

func DeleteRelationship(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var rel models.Relationship
	if err := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&rel).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "关系不存在"})
		return
	}

	before := toJSON(rel)
	models.DB.Delete(&rel)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "relationship",
		Action: "delete",
		Before: before,
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func toJSON(v interface{}) string {
	data, _ := json.Marshal(v)
	return string(data)
}
