package handlers

import (
	"encoding/json"
	"life-journal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetLogs(c *gin.Context) {
	userID := c.GetUint("user_id")
	var logs []models.Log
	models.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(100).Find(&logs)
	c.JSON(http.StatusOK, logs)
}

func UndoLastAction(c *gin.Context) {
	userID := c.GetUint("user_id")

	// Get last log
	var log models.Log
	if err := models.DB.Where("user_id = ?", userID).Order("created_at desc").First(&log).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "没有可撤销的操作"})
		return
	}

	// Undo based on entity and action
	switch log.Entity {
	case "person":
		undoPerson(log)
	case "relationship":
		undoRelationship(log)
	case "record":
		undoRecord(log)
	case "profile":
		undoProfile(log, userID)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "未知操作类型"})
		return
	}

	// Delete the log
	models.DB.Delete(&log)

	c.JSON(http.StatusOK, gin.H{"message": "撤销成功"})
}

func undoPerson(log models.Log) {
	switch log.Action {
	case "create":
		// Delete created person
		var person models.Person
		json.Unmarshal([]byte(log.After), &person)
		models.DB.Delete(&person)
	case "delete":
		// Restore deleted person
		var person models.Person
		json.Unmarshal([]byte(log.Before), &person)
		models.DB.Create(&person)
	case "update":
		// Restore previous state
		var person models.Person
		json.Unmarshal([]byte(log.Before), &person)
		models.DB.Save(&person)
	}
}

func undoRelationship(log models.Log) {
	switch log.Action {
	case "create":
		var rel models.Relationship
		json.Unmarshal([]byte(log.After), &rel)
		models.DB.Delete(&rel)
	case "delete":
		var rel models.Relationship
		json.Unmarshal([]byte(log.Before), &rel)
		models.DB.Create(&rel)
	case "update":
		var rel models.Relationship
		json.Unmarshal([]byte(log.Before), &rel)
		models.DB.Save(&rel)
	}
}

func undoRecord(log models.Log) {
	switch log.Action {
	case "create":
		var record models.Record
		json.Unmarshal([]byte(log.After), &record)
		models.DB.Delete(&record)
	case "delete":
		var record models.Record
		json.Unmarshal([]byte(log.Before), &record)
		models.DB.Create(&record)
	case "update":
		var record models.Record
		json.Unmarshal([]byte(log.Before), &record)
		models.DB.Save(&record)
	}
}

func undoProfile(log models.Log, userID uint) {
	// Restore previous profile
	var profile models.Profile
	json.Unmarshal([]byte(log.Before), &profile)
	models.DB.Save(&profile)
}
