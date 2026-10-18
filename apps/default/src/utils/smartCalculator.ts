import { SolarCalculation } from '../components/SolarCalculator';
import { SolarLearningEngine, RecommendationAdjustment } from './learningEngine';

export interface SmartCalculationResult extends SolarCalculation {
  // Original calculation results
  systemSize: number;
  batterySize: number;
  inverterSize: number;
  totalCost: number;
  monthlySavings: number;
  annualSavings: number;
  paybackPeriod: number;
  roi: number;
  
  // ML-enhanced results
  mlRecommendations: {
    recommendedSystemSize: number;
    recommendedBatterySize: number;
    adjustmentReasoning: string[];
    confidenceScore: number;
    potentialSavings: number;
    riskFactors: string[];
  };
  
  // Comparison data
  comparison: {
    standardVsMl: {
      systemSizeDiff: number;
      batterySizeDiff: number;
      costDiff: number;
      savingsDiff: number;
    };
  };
}

export class SmartSolarCalculator {
  private learningEngine: SolarLearningEngine;
  
  constructor() {
    this.learningEngine = new SolarLearningEngine();
  }

  /**
   * Enhanced calculation with ML recommendations
   */
  calculateWithML(input: SolarCalculation): SmartCalculationResult {
    // First, do standard calculation
    const standardResult = this.calculateStandard(input);
    
    // Get ML recommendations
    const mlAdjustments = this.learningEngine.getImprovedRecommendations(input);
    
    // Apply ML adjustments
    const mlEnhancedResult = this.applyMLAdjustments(standardResult, mlAdjustments);
    
    // Calculate comparison metrics
    const comparison = this.calculateComparison(standardResult, mlEnhancedResult);
    
    return {
      ...input,
      ...standardResult,
      mlRecommendations: mlEnhancedResult,
      comparison
    };
  }

  /**
   * Learn from user feedback
   */
  recordUserFeedback(calculation: SolarCalculation, feedback: {
    satisfied: boolean;
    converted: boolean;
    actualSystemSize?: number;
    actualBatterySize?: number;
    comments?: string;
  }): void {
    this.learningEngine.learnFromCalculation(calculation, feedback);
  }

  /**
   * Get learning analytics
   */
  getMLAnalytics() {
    return this.learningEngine.getAnalytics();
  }

  /**
   * Standard calculation (original logic)
   */
  private calculateStandard(input: SolarCalculation) {
    // South African solar calculation logic
    const avgSunHours = this.getAverageSunHours(input.location);
    const efficiencyFactor = this.getRoofEfficiency(input.roofOrientation);
    const loadshedingMultiplier = this.getLoadshedingMultiplier(input.loadshedding);
    
    // Calculate daily energy consumption from monthly bill
    const avgTariff = 2.5; // R2.50 per kWh average in SA
    const monthlyConsumption = input.monthlyBill / avgTariff;
    const dailyConsumption = monthlyConsumption / 30;
    
    // Calculate required system size
    const systemSize = Math.round((dailyConsumption / (avgSunHours * efficiencyFactor)) * 10) / 10;
    
    // Battery sizing based on load-shedding frequency
    const batterySize = Math.round(dailyConsumption * loadshedingMultiplier * 10) / 10;
    
    // Inverter sizing (typically 1.2x system size for safety margin)
    const inverterSize = Math.round(systemSize * 1.2 * 10) / 10;
    
    // Cost calculations (South African market rates)
    const systemCostPerKw = 15000; // R15,000 per kW installed
    const batteryCostPerKwh = 8000; // R8,000 per kWh
    const totalCost = Math.round((systemSize * systemCostPerKw) + (batterySize * batteryCostPerKwh));
    
    // Savings calculations
    const monthlySavings = Math.round(monthlyConsumption * avgTariff * 0.8); // 80% offset
    const annualSavings = monthlySavings * 12;
    
    // Payback period and ROI
    const paybackPeriod = Math.round((totalCost / annualSavings) * 10) / 10;
    const roi = Math.round((annualSavings / totalCost) * 100) / 100;
    
    return {
      systemSize,
      batterySize,
      inverterSize,
      totalCost,
      monthlySavings,
      annualSavings,
      paybackPeriod,
      roi
    };
  }

  /**
   * Apply ML adjustments to standard calculation
   */
  private applyMLAdjustments(standardResult: any, adjustments: RecommendationAdjustment) {
    const recommendedSystemSize = Math.round(standardResult.systemSize * adjustments.systemSizeMultiplier * 10) / 10;
    const recommendedBatterySize = Math.round(standardResult.batterySize * adjustments.batterySizeMultiplier * 10) / 10;
    
    // Recalculate costs with ML recommendations
    const systemCostPerKw = 15000;
    const batteryCostPerKwh = 8000;
    const mlTotalCost = Math.round((recommendedSystemSize * systemCostPerKw) + (recommendedBatterySize * batteryCostPerKwh));
    
    // Estimate improved savings based on better sizing
    const improvementFactor = this.calculateImprovementFactor(adjustments);
    const potentialSavings = Math.round(standardResult.annualSavings * improvementFactor);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(adjustments, standardResult);
    
    return {
      recommendedSystemSize,
      recommendedBatterySize,
      adjustmentReasoning: adjustments.reasoning,
      confidenceScore: adjustments.confidenceScore,
      potentialSavings,
      riskFactors
    };
  }

  /**
   * Calculate improvement factor based on ML adjustments
   */
  private calculateImprovementFactor(adjustments: RecommendationAdjustment): number {
    // Base improvement from better sizing
    let improvement = 1.0;
    
    // System size optimization can improve efficiency
    if (adjustments.systemSizeMultiplier > 1.0) {
      improvement += (adjustments.systemSizeMultiplier - 1.0) * 0.5; // 50% of size increase translates to savings
    }
    
    // Battery optimization reduces grid dependency
    if (adjustments.batterySizeMultiplier > 1.0) {
      improvement += (adjustments.batterySizeMultiplier - 1.0) * 0.3; // 30% of battery increase translates to savings
    }
    
    // Confidence factor - higher confidence means more reliable improvement
    improvement = 1.0 + ((improvement - 1.0) * adjustments.confidenceScore);
    
    return Math.min(1.5, improvement); // Cap at 50% improvement
  }

  /**
   * Identify potential risk factors
   */
  private identifyRiskFactors(adjustments: RecommendationAdjustment, standardResult: any): string[] {
    const risks: string[] = [];
    
    if (adjustments.confidenceScore < 0.5) {
      risks.push('Low confidence in ML recommendations due to limited similar data');
    }
    
    if (adjustments.systemSizeMultiplier > 1.3) {
      risks.push('Recommended system size significantly larger than standard calculation');
    }
    
    if (adjustments.batterySizeMultiplier > 1.5) {
      risks.push('Recommended battery size much larger - consider roof space constraints');
    }
    
    if (standardResult.paybackPeriod > 10) {
      risks.push('Long payback period - consider financing options');
    }
    
    return risks;
  }

  /**
   * Calculate comparison between standard and ML recommendations
   */
  private calculateComparison(standard: any, mlResult: any) {
    return {
      standardVsMl: {
        systemSizeDiff: ((mlResult.recommendedSystemSize - standard.systemSize) / standard.systemSize) * 100,
        batterySizeDiff: ((mlResult.recommendedBatterySize - standard.batterySize) / standard.batterySize) * 100,
        costDiff: 0, // Will be calculated based on new sizes
        savingsDiff: ((mlResult.potentialSavings - standard.annualSavings) / standard.annualSavings) * 100
      }
    };
  }

  /**
   * Helper methods (same as original calculator)
   */
  private getAverageSunHours(location: string): number {
    const sunHours: { [key: string]: number } = {
      'cape town': 6.2,
      'johannesburg': 5.8,
      'durban': 5.5,
      'pretoria': 5.9,
      'port elizabeth': 6.0,
      'bloemfontein': 6.1,
      'kimberley': 6.3,
      'upington': 6.8
    };
    
    const city = location.toLowerCase();
    for (const [key, hours] of Object.entries(sunHours)) {
      if (city.includes(key)) return hours;
    }
    return 5.8; // Default average for SA
  }

  private getRoofEfficiency(orientation: string): number {
    const efficiencies: { [key: string]: number } = {
      'north': 1.0,
      'north-east': 0.95,
      'north-west': 0.95,
      'east': 0.85,
      'west': 0.85,
      'south-east': 0.75,
      'south-west': 0.75,
      'south': 0.65
    };
    return efficiencies[orientation.toLowerCase()] || 0.85;
  }

  private getLoadshedingMultiplier(frequency: string): number {
    const multipliers = {
      'low': 0.3,
      'medium': 0.5,
      'high': 0.8
    };
    return multipliers[frequency as keyof typeof multipliers] || 0.5;
  }

  /**
   * Reset all learning data
   */
  resetLearning(): void {
    this.learningEngine.resetLearning();
  }
}