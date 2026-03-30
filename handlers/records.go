package handlers

import (
	"encoding/json"
	"life-journal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RecordInput struct {
	Category  string   `json:"category"`
	Title     string   `json:"title"`
	Date      string   `json:"date"`
	Tags      []string `json:"tags"`
	Content   string   `json:"content"`
	Image     string   `json:"image"`
	Video     string   `json:"video"`
	Locations []Location `json:"locations"`
	Itinerary []Itinerary `json:"itinerary"`
}

type Location struct {
	Lat   float64 `json:"lat"`
	Lng   float64 `json:"lng"`
	Label string  `json:"label"`
}

type Itinerary struct {
	Time     string `json:"time"`
	Activity string `json:"activity"`
}

func GetRecords(c *gin.Context) {
	userID := c.GetUint("user_id")
	category := c.Query("category")
	tag := c.Query("tag")

	var records []models.Record
	query := models.DB.Where("user_id = ?", userID)

	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Find(&records)

	// Filter by tag in Go (since tags are stored as JSON)
	if tag != "" {
		var filtered []models.Record
		for _, r := range records {
			var tags []string
			json.Unmarshal([]byte(r.Tags), &tags)
			for _, t := range tags {
				if t == tag || contains(t, tag) {
					filtered = append(filtered, r)
					break
				}
			}
		}
		records = filtered
	}

	c.JSON(http.StatusOK, records)
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsHelper(s, substr))
}

func containsHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func GetRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var record models.Record
	if err := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func CreateRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input RecordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tagsJSON, _ := json.Marshal(input.Tags)
	locationsJSON, _ := json.Marshal(input.Locations)
	itineraryJSON, _ := json.Marshal(input.Itinerary)

	record := models.Record{
		UserID:    userID,
		Category:  input.Category,
		Title:     input.Title,
		Date:      input.Date,
		Tags:      string(tagsJSON),
		Content:   input.Content,
		Image:     input.Image,
		Video:     input.Video,
		Locations: string(locationsJSON),
		Itinerary: string(itineraryJSON),
	}
	models.DB.Create(&record)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "record",
		Action: "create",
		After:  toJSON(record),
	}
	models.DB.Create(&log)

	c.JSON(http.StatusCreated, record)
}

func UpdateRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var record models.Record
	if err := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	var input RecordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	before := toJSON(record)

	tagsJSON, _ := json.Marshal(input.Tags)
	locationsJSON, _ := json.Marshal(input.Locations)
	itineraryJSON, _ := json.Marshal(input.Itinerary)

	record.Category = input.Category
	record.Title = input.Title
	record.Date = input.Date
	record.Tags = string(tagsJSON)
	record.Content = input.Content
	record.Image = input.Image
	record.Video = input.Video
	record.Locations = string(locationsJSON)
	record.Itinerary = string(itineraryJSON)
	models.DB.Save(&record)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "record",
		Action: "update",
		Before: before,
		After:  toJSON(record),
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, record)
}

func DeleteRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var record models.Record
	if err := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	before := toJSON(record)
	models.DB.Delete(&record)

	// Log
	log := models.Log{
		UserID: userID,
		Entity: "record",
		Action: "delete",
		Before: before,
	}
	models.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
