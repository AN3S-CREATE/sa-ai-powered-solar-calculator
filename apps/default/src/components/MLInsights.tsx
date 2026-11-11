import React, { useState } from 'react';
import { SmartCalculationResult } from '../utils/smartCalculator';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface MLInsightsProps {
  result: SmartCalculationResult;
  onFeedback: (feedback: {
    satisfied: boolean;
    converted: boolean;
    actualSystemSize?: number;
    actualBatterySize?: number;
    comments?: string;
  }) => void;
}

export const MLInsights: React.FC<MLInsightsProps> = ({ result, onFeedback }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    satisfied: true,
    converted: false,
    actualSystemSize: result.mlRecommendations.recommendedSystemSize,
    actualBatterySize: result.mlRecommendations.recommendedBatterySize,
    comments: ''
  });

  const handleSubmitFeedback = () => {
    onFeedback(feedbackData);
    setShowFeedback(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-[#48E1FD]';
    if (score >= 0.6) return 'text-[#B2B1B6]';
    return 'text-[#B2B1B6]/70';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-[#48E1FD]" />
          <div>
            <h2 className="text-2xl font-bold text-[#FFFFFF]">AI-Enhanced Recommendations</h2>
            <p className="text-[#B2B1B6]">Machine learning insights based on similar installations</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${getConfidenceColor(result.mlRecommendations.confidenceScore)}`}>
            {Math.round(result.mlRecommendations.confidenceScore * 100)}%
          </div>
          <div className="text-sm text-[#B2B1B6]">{getConfidenceLabel(result.mlRecommendations.confidenceScore)}</div>
        </div>
      </div>

      {/* ML Recommendations vs Standard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Standard Calculation */}
        <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3">Standard Calculation</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">System Size:</span>
              <span className="text-[#FFFFFF] font-medium">{result.systemSize}kWp</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">Battery Size:</span>
              <span className="text-[#FFFFFF] font-medium">{result.batterySize}kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">Total Cost:</span>
              <span className="text-[#FFFFFF] font-medium">R{result.totalCost?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">Annual Savings:</span>
              <span className="text-[#FFFFFF] font-medium">R{result.annualSavings?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ML Recommendations */}
        <div className="bg-[#03041D] rounded-lg p-4 border border-[#48E1FD]/30">
          <h3 className="text-lg font-semibold text-[#48E1FD] mb-3 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Recommendations
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">System Size:</span>
              <div className="flex items-center space-x-2">
                <span className="text-[#48E1FD] font-medium">{result.mlRecommendations.recommendedSystemSize}kWp</span>
                {result.comparison.standardVsMl.systemSizeDiff !== 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.comparison.standardVsMl.systemSizeDiff > 0 
                      ? 'bg-[#48E1FD]/20 text-[#48E1FD]'
                      : 'bg-[#B2B1B6]/20 text-[#B2B1B6]'
                  }`}>
                    {result.comparison.standardVsMl.systemSizeDiff > 0 ? '+' : ''}{result.comparison.standardVsMl.systemSizeDiff.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">Battery Size:</span>
              <div className="flex items-center space-x-2">
                <span className="text-[#48E1FD] font-medium">{result.mlRecommendations.recommendedBatterySize}kWh</span>
                {result.comparison.standardVsMl.batterySizeDiff !== 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.comparison.standardVsMl.batterySizeDiff > 0 
                      ? 'bg-[#48E1FD]/20 text-[#48E1FD]'
                      : 'bg-[#B2B1B6]/20 text-[#B2B1B6]'
                  }`}>
                    {result.comparison.standardVsMl.batterySizeDiff > 0 ? '+' : ''}{result.comparison.standardVsMl.batterySizeDiff.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">Potential Savings:</span>
              <span className="text-[#48E1FD] font-medium">R{result.mlRecommendations.potentialSavings?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B2B1B6]">Improvement:</span>
              <span className="text-[#48E1FD] font-medium">
                +{result.comparison.standardVsMl.savingsDiff.toFixed(1)}% savings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="bg-[#03041D] rounded-lg p-4 mb-6 border border-[#B2B1B6]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-[#48E1FD]" />
          AI Reasoning
        </h3>
        <ul className="space-y-2">
          {result.mlRecommendations.adjustmentReasoning.map((reason, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#48E1FD] mt-0.5 flex-shrink-0" />
              <span className="text-[#B2B1B6] text-sm">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Factors */}
      {result.mlRecommendations.riskFactors.length > 0 && (
        <div className="bg-[#03041D] rounded-lg p-4 mb-6 border border-[#48E1FD]/30">
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-[#48E1FD]" />
            Considerations
          </h3>
          <ul className="space-y-2">
            {result.mlRecommendations.riskFactors.map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#48E1FD] mt-0.5 flex-shrink-0" />
                <span className="text-[#B2B1B6] text-sm">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback Section */}
      <div className="border-t border-[#B2B1B6]/20 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#FFFFFF]">Help Improve Our AI</h3>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 font-medium"
          >
            Provide Feedback
          </button>
        </div>

        {showFeedback && (
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <div className="space-y-4">
              {/* Satisfaction */}
              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                  How satisfied are you with these recommendations?
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, satisfied: true }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      feedbackData.satisfied 
                        ? 'bg-[#48E1FD] text-[#03041D]'
                        : 'bg-[#080A24] text-[#B2B1B6] hover:bg-[#48E1FD]/10'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Satisfied</span>
                  </button>
                  <button
                    onClick={() => setFeedbackData(prev => ({ ...prev, satisfied: false }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      !feedbackData.satisfied 
                        ? 'bg-[#48E1FD] text-[#03041D]'
                        : 'bg-[#080A24] text-[#B2B1B6] hover:bg-[#48E1FD]/10'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Not Satisfied</span>
                  </button>
                </div>
              </div>

              {/* Conversion Intent */}
              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                  Are you likely to proceed with a solar installation?
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={feedbackData.converted}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, converted: e.target.checked }))}
                    className="rounded border-[#B2B1B6]/30 text-[#48E1FD] focus:ring-[#48E1FD] bg-[#03041D]"
                  />
                  <span className="text-[#B2B1B6]">Yes, I'm interested in proceeding</span>
                </div>
              </div>

              {/* Actual System Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    Preferred System Size (kWp)
                  </label>
                  <input
                    type="number"
                    value={feedbackData.actualSystemSize}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, actualSystemSize: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#080A24] text-[#FFFFFF]"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    Preferred Battery Size (kWh)
                  </label>
                  <input
                    type="number"
                    value={feedbackData.actualBatterySize}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, actualBatterySize: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#080A24] text-[#FFFFFF]"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#080A24] text-[#FFFFFF] placeholder-[#B2B1B6]"
                  rows={3}
                  placeholder="Any specific requirements or concerns?"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 text-[#B2B1B6] hover:text-[#FFFFFF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 font-medium flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
