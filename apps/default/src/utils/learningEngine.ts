import { SolarCalculation } from '../components/SolarCalculator';

export interface UserPattern {
  locationCluster: string;
  billRange: string;
  propertyType: string;
  roofOrientation: string;
  loadshedding: string;
  averageSystemSize: number;
  averageBatterySize: number;
  satisfactionScore: number;
  conversionRate: number;
}

export interface RecommendationAdjustment {
  systemSizeMultiplier: number;
  batterySizeMultiplier: number;
  confidenceScore: number;
  reasoning: string[];
}

export class SolarLearningEngine {
  private patterns: UserPattern[] = [];
  private readonly MIN_SAMPLES = 5; // Minimum samples needed for learning

  constructor() {
    this.loadStoredPatterns();
  }

  /**
   * Learn from a new user calculation
   */
  learnFromCalculation(calculation: SolarCalculation, userFeedback?: {
    satisfied: boolean;
    converted: boolean;
    actualSystemSize?: number;
    actualBatterySize?: number;
  }): void {
    const pattern = this.extractPattern(calculation, userFeedback);
    this.updatePatterns(pattern);
    this.savePatterns();
  }

  /**
   * Get improved recommendations based on learned patterns
   */
  getImprovedRecommendations(calculation: SolarCalculation): RecommendationAdjustment {
    const similarPatterns = this.findSimilarPatterns(calculation);
    
    if (similarPatterns.length < this.MIN_SAMPLES) {
      return {
        systemSizeMultiplier: 1.0,
        batterySizeMultiplier: 1.0,
        confidenceScore: 0.3,
        reasoning: ['Insufficient data for ML recommendations', 'Using standard calculations']
      };
    }

    return this.calculateAdjustments(similarPatterns, calculation);
  }

  /**
   * Extract pattern from user calculation
   */
  private extractPattern(calculation: SolarCalculation, feedback?: any): UserPattern {
    return {
      locationCluster: this.getLocationCluster(calculation.location),
      billRange: this.getBillRange(calculation.monthlyBill),
      propertyType: calculation.propertyType,
      roofOrientation: this.normalizeOrientation(calculation.roofOrientation),
      loadshedding: calculation.loadshedding,
      averageSystemSize: calculation.systemSize || 0,
      averageBatterySize: calculation.batterySize || 0,
      satisfactionScore: feedback?.satisfied ? 1 : 0,
      conversionRate: feedback?.converted ? 1 : 0
    };
  }

  /**
   * Find similar user patterns for comparison
   */
  private findSimilarPatterns(calculation: SolarCalculation): UserPattern[] {
    const targetPattern = this.extractPattern(calculation);
    
    return this.patterns.filter(pattern => {
      let similarity = 0;
      let totalWeight = 0;

      // Location similarity (weight: 3)
      if (pattern.locationCluster === targetPattern.locationCluster) {
        similarity += 3;
      }
      totalWeight += 3;

      // Bill range similarity (weight: 2)
      if (pattern.billRange === targetPattern.billRange) {
        similarity += 2;
      }
      totalWeight += 2;

      // Property type similarity (weight: 2)
      if (pattern.propertyType === targetPattern.propertyType) {
        similarity += 2;
      }
      totalWeight += 2;

      // Roof orientation similarity (weight: 1)
      if (pattern.roofOrientation === targetPattern.roofOrientation) {
        similarity += 1;
      }
      totalWeight += 1;

      // Load-shedding similarity (weight: 1)
      if (pattern.loadshedding === targetPattern.loadshedding) {
        similarity += 1;
      }
      totalWeight += 1;

      // Return patterns with >60% similarity
      return (similarity / totalWeight) > 0.6;
    });
  }

  /**
   * Calculate recommended adjustments based on similar patterns
   */
  private calculateAdjustments(patterns: UserPattern[], calculation: SolarCalculation): RecommendationAdjustment {
    const reasoning: string[] = [];
    
    // Calculate average system sizes from successful installations
    const successfulPatterns = patterns.filter(p => p.satisfactionScore > 0.5);
    const convertedPatterns = patterns.filter(p => p.conversionRate > 0);

    if (successfulPatterns.length === 0) {
      return {
        systemSizeMultiplier: 1.0,
        batterySizeMultiplier: 1.0,
        confidenceScore: 0.4,
        reasoning: ['No successful similar installations found', 'Using conservative estimates']
      };
    }

    // Calculate optimal system size multiplier
    const avgSuccessfulSystemSize = successfulPatterns.reduce((sum, p) => sum + p.averageSystemSize, 0) / successfulPatterns.length;
    const currentEstimate = calculation.systemSize || 5; // Default fallback
    const systemSizeMultiplier = Math.max(0.7, Math.min(1.5, avgSuccessfulSystemSize / currentEstimate));

    // Calculate optimal battery size multiplier
    const avgSuccessfulBatterySize = successfulPatterns.reduce((sum, p) => sum + p.averageBatterySize, 0) / successfulPatterns.length;
    const currentBatteryEstimate = calculation.batterySize || 10; // Default fallback
    const batterySizeMultiplier = Math.max(0.5, Math.min(2.0, avgSuccessfulBatterySize / currentBatteryEstimate));

    // Build reasoning
    reasoning.push(`Based on ${successfulPatterns.length} similar successful installations`);
    
    if (systemSizeMultiplier > 1.1) {
      reasoning.push(`Users with similar profiles typically need ${Math.round((systemSizeMultiplier - 1) * 100)}% larger solar systems`);
    } else if (systemSizeMultiplier < 0.9) {
      reasoning.push(`Similar users found smaller systems sufficient, reducing by ${Math.round((1 - systemSizeMultiplier) * 100)}%`);
    }

    if (batterySizeMultiplier > 1.1) {
      reasoning.push(`Battery storage increased based on similar user experiences with load-shedding`);
    }

    // Calculate confidence score
    const sampleSize = Math.min(patterns.length / 20, 1); // More samples = higher confidence
    const conversionRate = convertedPatterns.length / patterns.length;
    const satisfactionRate = successfulPatterns.length / patterns.length;
    
    const confidenceScore = Math.min(0.95, 0.3 + (sampleSize * 0.3) + (conversionRate * 0.2) + (satisfactionRate * 0.2));

    return {
      systemSizeMultiplier,
      batterySizeMultiplier,
      confidenceScore,
      reasoning
    };
  }

  /**
   * Update patterns with new data
   */
  private updatePatterns(newPattern: UserPattern): void {
    // Find existing similar pattern
    const existingIndex = this.patterns.findIndex(p => 
      p.locationCluster === newPattern.locationCluster &&
      p.billRange === newPattern.billRange &&
      p.propertyType === newPattern.propertyType &&
      p.roofOrientation === newPattern.roofOrientation &&
      p.loadshedding === newPattern.loadshedding
    );

    if (existingIndex >= 0) {
      // Update existing pattern with weighted average
      const existing = this.patterns[existingIndex];
      const weight = 0.3; // New data weight
      
      this.patterns[existingIndex] = {
        ...existing,
        averageSystemSize: existing.averageSystemSize * (1 - weight) + newPattern.averageSystemSize * weight,
        averageBatterySize: existing.averageBatterySize * (1 - weight) + newPattern.averageBatterySize * weight,
        satisfactionScore: existing.satisfactionScore * (1 - weight) + newPattern.satisfactionScore * weight,
        conversionRate: existing.conversionRate * (1 - weight) + newPattern.conversionRate * weight
      };
    } else {
      // Add new pattern
      this.patterns.push(newPattern);
    }

    // Limit patterns to prevent memory issues
    if (this.patterns.length > 1000) {
      this.patterns = this.patterns.slice(-800); // Keep most recent 800
    }
  }

  /**
   * Get analytics about learned patterns
   */
  getAnalytics(): {
    totalPatterns: number;
    conversionRate: number;
    satisfactionRate: number;
    topPerformingConfigs: Array<{
      config: string;
      avgSystemSize: number;
      avgBatterySize: number;
      successRate: number;
    }>;
  } {
    const totalPatterns = this.patterns.length;
    const conversionRate = this.patterns.reduce((sum, p) => sum + p.conversionRate, 0) / totalPatterns;
    const satisfactionRate = this.patterns.reduce((sum, p) => sum + p.satisfactionScore, 0) / totalPatterns;

    // Group by configuration and find top performers
    const configGroups = new Map<string, UserPattern[]>();
    
    this.patterns.forEach(pattern => {
      const configKey = `${pattern.locationCluster}-${pattern.billRange}-${pattern.propertyType}`;
      if (!configGroups.has(configKey)) {
        configGroups.set(configKey, []);
      }
      configGroups.get(configKey)!.push(pattern);
    });

    const topPerformingConfigs = Array.from(configGroups.entries())
      .map(([config, patterns]) => ({
        config,
        avgSystemSize: patterns.reduce((sum, p) => sum + p.averageSystemSize, 0) / patterns.length,
        avgBatterySize: patterns.reduce((sum, p) => sum + p.averageBatterySize, 0) / patterns.length,
        successRate: patterns.reduce((sum, p) => sum + p.satisfactionScore, 0) / patterns.length
      }))
      .filter(config => config.successRate > 0.6)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    return {
      totalPatterns,
      conversionRate,
      satisfactionRate,
      topPerformingConfigs
    };
  }

  /**
   * Helper methods for pattern extraction
   */
  private getLocationCluster(location: string): string {
    const city = location.toLowerCase();
    if (city.includes('cape town')) return 'western-cape';
    if (city.includes('johannesburg') || city.includes('pretoria')) return 'gauteng';
    if (city.includes('durban')) return 'kwazulu-natal';
    if (city.includes('port elizabeth')) return 'eastern-cape';
    return 'other';
  }

  private getBillRange(monthlyBill: number): string {
    if (monthlyBill < 1000) return 'low';
    if (monthlyBill < 2500) return 'medium';
    if (monthlyBill < 5000) return 'high';
    return 'very-high';
  }

  private normalizeOrientation(orientation: string): string {
    const normalized = orientation.toLowerCase();
    if (normalized.includes('north')) return 'north';
    if (normalized.includes('south')) return 'south';
    if (normalized.includes('east')) return 'east';
    if (normalized.includes('west')) return 'west';
    return 'other';
  }

  /**
   * Storage methods
   */
  private loadStoredPatterns(): void {
    try {
      const stored = localStorage.getItem('solarLearningPatterns');
      if (stored) {
        this.patterns = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load learning patterns:', error);
      this.patterns = [];
    }
  }

  private savePatterns(): void {
    try {
      localStorage.setItem('solarLearningPatterns', JSON.stringify(this.patterns));
    } catch (error) {
      console.warn('Failed to save learning patterns:', error);
    }
  }

  /**
   * Reset learning data (for testing or privacy)
   */
  resetLearning(): void {
    this.patterns = [];
    localStorage.removeItem('solarLearningPatterns');
  }
}