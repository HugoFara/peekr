import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the pure functions
import { calculateCoefficients, moveCalibratedDot } from '../src/index.js';

describe('Pure Functions Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateCoefficients', () => {
    it('should calculate coefficients correctly for different distances', () => {
      // Test with distance 60cm
      const result60 = calculateCoefficients(60);
      expect(result60.coef_x).toBe(-4.5); // -270 / 60
      expect(result60.coef_y).toBeCloseTo(5.83, 2); // 350 / 60
      
      // Test with distance 40cm
      const result40 = calculateCoefficients(40);
      expect(result40.coef_x).toBe(-6.75); // -270 / 40
      expect(result40.coef_y).toBe(8.75); // 350 / 40
      
      // Test with distance 80cm
      const result80 = calculateCoefficients(80);
      expect(result80.coef_x).toBe(-3.375); // -270 / 80
      expect(result80.coef_y).toBe(4.375); // 350 / 80
    });

    it('should handle zero distance gracefully', () => {
      const result = calculateCoefficients(0);
      expect(result.coef_x).toBe(-Infinity);
      expect(result.coef_y).toBe(Infinity);
    });

    it('should handle negative distance', () => {
      const result = calculateCoefficients(-30);
      expect(result.coef_x).toBe(9); // -270 / -30
      expect(result.coef_y).toBeCloseTo(-11.67, 2); // 350 / -30
    });

    it('should handle very large distance values', () => {
      const result = calculateCoefficients(1000);
      expect(result.coef_x).toBe(-0.27); // -270 / 1000
      expect(result.coef_y).toBe(0.35); // 350 / 1000
    });

    it('should handle very small distance values', () => {
      const result = calculateCoefficients(0.1);
      expect(result.coef_x).toBe(-2700); // -270 / 0.1
      expect(result.coef_y).toBe(3500); // 350 / 0.1
    });

    it('should handle invalid distance values', () => {
      // Test with NaN
      const resultNaN = calculateCoefficients(NaN);
      expect(resultNaN.coef_x).toBeNaN();
      expect(resultNaN.coef_y).toBeNaN();
      
      // Test with undefined
      const resultUndefined = calculateCoefficients(undefined);
      expect(resultUndefined.coef_x).toBeNaN();
      expect(resultUndefined.coef_y).toBeNaN();
    });
  });

  describe('moveCalibratedDot', () => {
    // Mock screen dimensions
    const mockScreen = { width: 1920, height: 1080 };
    
    beforeEach(() => {
      // Mock global screen object
      global.screen = mockScreen;
    });

    it('should calculate screen coordinates correctly', () => {
      // Test with center gaze (0.5, 0.5) and distance 60cm
      const [xpred, ypred] = moveCalibratedDot(0.5, 0.5, 60, 0.2, -0.5);
      
      // Expected calculations:
      // coef_x = -270 / 60 = -4.5
      // coef_y = 350 / 60 = 5.83
      // xpred = (-4.5 * (0.5 - 0.5) + 0.2) * 1920 = 0.2 * 1920 = 384
      // ypred = (5.83 * 0.5 + (-0.5)) * 1080 = (2.915 - 0.5) * 1080 = 2.415 * 1080 = 2608.2
      
      expect(xpred).toBe(384);
      expect(ypred).toBeCloseTo(2610, 0);
    });

    it('should handle edge cases', () => {
      // Test with rawX = 0, rawY = 0
      const [xpred1, ypred1] = moveCalibratedDot(0, 0, 60, 0, 0);
      expect(xpred1).toBe(4320); // (-4.5 * (0 - 0.5) + 0) * 1920 = 2.25 * 1920
      expect(ypred1).toBe(0); // (5.83 * 0 + 0) * 1080
      
      // Test with rawX = 1, rawY = 1
      const [xpred2, ypred2] = moveCalibratedDot(1, 1, 60, 0, 0);
      expect(xpred2).toBe(-4320); // (-4.5 * (1 - 0.5) + 0) * 1920 = -2.25 * 1920
      expect(ypred2).toBeCloseTo(6300, 0); // (5.83 * 1 + 0) * 1080
    });

    it('should apply intercepts correctly', () => {
      const [xpred, ypred] = moveCalibratedDot(0.5, 0.5, 60, 0.1, 0.2);
      
      // Expected calculations with intercepts:
      // xpred = (-4.5 * (0.5 - 0.5) + 0.1) * 1920 = 0.1 * 1920 = 192
      // ypred = (5.83 * 0.5 + 0.2) * 1080 = (2.915 + 0.2) * 1080 = 3.115 * 1080 = 3364.2
      
      expect(xpred).toBe(192);
      expect(ypred).toBeCloseTo(3366, 0);
    });

    it('should handle different screen resolutions', () => {
      // Test with different screen dimensions
      global.screen = { width: 1366, height: 768 };
      
      const [xpred, ypred] = moveCalibratedDot(0.5, 0.5, 60, 0.1, 0.2);
      
      // Expected calculations with 1366x768 screen:
      // xpred = (-4.5 * (0.5 - 0.5) + 0.1) * 1366 = 0.1 * 1366 = 136.6
      // ypred = (5.83 * 0.5 + 0.2) * 768 = (2.915 + 0.2) * 768 = 3.115 * 768 = 2392.32
      
      expect(xpred).toBe(136.6);
      expect(ypred).toBeCloseTo(2394, 0);
    });

    it('should handle extreme gaze coordinates', () => {
      // Test with very small values
      const [xpred1, ypred1] = moveCalibratedDot(0.001, 0.001, 60, 0, 0);
      expect(xpred1).toBeCloseTo(4311, 0); // (-4.5 * (0.001 - 0.5) + 0) * 1920
      expect(ypred1).toBeCloseTo(6.3, 1); // (5.83 * 0.001 + 0) * 1080
      
      // Test with values close to 1
      const [xpred2, ypred2] = moveCalibratedDot(0.999, 0.999, 60, 0, 0);
      expect(xpred2).toBeCloseTo(-4311, 0); // (-4.5 * (0.999 - 0.5) + 0) * 1920
      expect(ypred2).toBeCloseTo(6293.5, 0); // (5.83 * 0.999 + 0) * 1080
    });

    it('should handle different distances', () => {
      // Test with distance 40cm
      const [xpred1, ypred1] = moveCalibratedDot(0.5, 0.5, 40, 0.1, 0.2);
      // coef_x = -270 / 40 = -6.75, coef_y = 350 / 40 = 8.75
      expect(xpred1).toBe(192); // (-6.75 * (0.5 - 0.5) + 0.1) * 1920
      expect(ypred1).toBeCloseTo(4941, 0); // (8.75 * 0.5 + 0.2) * 1080
      
      // Test with distance 80cm
      const [xpred2, ypred2] = moveCalibratedDot(0.5, 0.5, 80, 0.1, 0.2);
      // coef_x = -270 / 80 = -3.375, coef_y = 350 / 80 = 4.375
      expect(xpred2).toBe(192); // (-3.375 * (0.5 - 0.5) + 0.1) * 1920
      expect(ypred2).toBeCloseTo(2578, -1); // (4.375 * 0.5 + 0.2) * 1080
    });
  });

  describe('Mathematical edge cases', () => {
    it('should handle division by zero in coefficient calculation', () => {
      const result = calculateCoefficients(0);
      expect(result.coef_x).toBe(-Infinity);
      expect(result.coef_y).toBe(Infinity);
    });

    it('should handle very large numbers', () => {
      const result = calculateCoefficients(Number.MAX_SAFE_INTEGER);
      expect(result.coef_x).toBeCloseTo(0, 10);
      expect(result.coef_y).toBeCloseTo(0, 10);
    });

    it('should handle very small numbers', () => {
      const result = calculateCoefficients(Number.MIN_SAFE_INTEGER);
      expect(result.coef_x).toBeCloseTo(0, 10);
      expect(result.coef_y).toBeCloseTo(0, 10);
    });

    it('should handle floating point precision', () => {
      const result = calculateCoefficients(60.0000000000001);
      expect(result.coef_x).toBeCloseTo(-4.5, 10);
      expect(result.coef_y).toBeCloseTo(5.83, 2);
    });
  });

  describe('Integration tests for coefficient and dot movement', () => {
    it('should maintain consistency between coefficient calculation and dot movement', () => {
      const distance = 60;
      const { coef_x, coef_y } = calculateCoefficients(distance);
      
      // Test that the coefficients used in moveCalibratedDot match
      const [xpred, ypred] = moveCalibratedDot(0.5, 0.5, distance, 0, 0);
      
      // Manual calculation using the same coefficients
      const manualX = (coef_x * (0.5 - 0.5) + 0) * 1920;
      const manualY = (coef_y * 0.5 + 0) * 1080;
      
      expect(xpred).toBe(manualX);
      expect(ypred).toBe(manualY);
    });

    it('should handle the complete calculation pipeline', () => {
      // Test the complete pipeline: distance -> coefficients -> screen coordinates
      const distances = [40, 60, 80, 100];
      const gazePoints = [
        { x: 0.1, y: 0.1 },
        { x: 0.5, y: 0.5 },
        { x: 0.9, y: 0.9 }
      ];
      
      distances.forEach(distance => {
        const { coef_x, coef_y } = calculateCoefficients(distance);
        
        gazePoints.forEach(point => {
          const [xpred, ypred] = moveCalibratedDot(point.x, point.y, distance, 0, 0);
          
          // Verify the calculations are mathematically sound
          const expectedX = (coef_x * (point.x - 0.5) + 0) * 1920;
          const expectedY = (coef_y * point.y + 0) * 1080;
          
          expect(xpred).toBe(expectedX);
          expect(ypred).toBe(expectedY);
        });
      });
    });
  });
}); 