
describe("AdaptiveLearning", function() {
  var adaptiveLearning;

  beforeEach(function() {
    adaptiveLearning = new AdaptiveLearning("testUser");
  });

  it("should add a scan to user history", function() {
    adaptiveLearning.addScanToHistory({ result: "بكر ممتاز", confidence: 95 });
    expect(adaptiveLearning.userHistory.length).toBe(1);
  });

  it("should calculate usage patterns", function() {
    adaptiveLearning.addScanToHistory({ result: "بكر ممتاز", confidence: 90 });
    adaptiveLearning.addScanToHistory({ result: "بكر ممتاز", confidence: 80 });
    var patterns = adaptiveLearning.calculateUsagePatterns();
    expect(patterns.totalScans).toBe(2);
    expect(patterns.averageConfidence).toBe(85);
  });

  it("should get user level", function() {
    for (var i = 0; i < 5; i++) {
      adaptiveLearning.addScanToHistory({ result: "بكر ممتاز", confidence: 90 });
    }
    expect(adaptiveLearning.getUserLevel()).toBe("متوسط");
  });

  it("should generate recommendations", function() {
    var patterns = {
      averageConfidence: 60,
      scanFrequency: "منخفض",
      improvementTrend: "متجه للتراجع"
    };
    var recommendations = adaptiveLearning.generateRecommendations(patterns);
    expect(recommendations.length).toBe(3);
  });
});
