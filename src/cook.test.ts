// Unit tests for cook.ts - Tests for utility functions in the recipe parsing module
import { estimateFraction, isInArray } from './cook';

describe('estimateFraction', () => {
  test('handles integer numbers correctly', () => {
    const result = estimateFraction(3);
    expect(result).toBe('3');
  });

  test('handles decimal values correctly', () => {
    const result = estimateFraction(1.5);
    expect(result).toBe('½');
  });

  test('estimates 1/2 (½) for object with num=1, den=2', () => {
    const quantity = { whole: 0, num: 1, den: 2 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('½');
  });

  test('estimates 2/3 (⅔) for object with num=2, den=3', () => {
    const quantity = { whole: 0, num: 2, den: 3 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅔');
  });

  test('estimates 1/4 (¼) for object with num=1, den=4', () => {
    const quantity = { whole: 0, num: 1, den: 4 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('¼');
  });

  test('estimates 3/4 (¾) for object with num=3, den=4', () => {
    const quantity = { whole: 0, num: 3, den: 4 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('¾');
  });

  test('estimates 1/6 (⅙) for object with num=1, den=6', () => {
    const quantity = { whole: 0, num: 1, den: 6 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅙');
  });

  test('estimates 5/6 (⅚) for object with num=5, den=6', () => {
    const quantity = { whole: 0, num: 5, den: 6 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅚');
  });

  test('estimates 1/8 (⅛) for object with num=1, den=8', () => {
    const quantity = { whole: 0, num: 1, den: 8 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅛');
  });

  test('estimates 3/8 (⅜) for object with num=3, den=8', () => {
    const quantity = { whole: 0, num: 3, den: 8 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅜');
  });

  test('estimates 5/8 (⅝) for object with num=5, den=8', () => {
    const quantity = { whole: 0, num: 5, den: 8 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅝');
  });

  test('estimates 7/8 (⅞) for object with num=7, den=8', () => {
    const quantity = { whole: 0, num: 7, den: 8 } as any;
    const result = estimateFraction(quantity);
    expect(result).toBe('⅞');
  });

  test('handles string input (returns as-is)', () => {
    const result = estimateFraction('cups');
    expect(result).toBe('cups');
  });
});

describe('isInArray', () => {
  test('returns false for undefined array', () => {
    const result = isInArray(undefined as any, 'test');
    expect(result).toBe(false);
  });

  test('returns false for undefined string', () => {
    const result = isInArray(['a', 'b'], undefined as any);
    expect(result).toBe(false);
  });

  test('returns false for empty array', () => {
    const result = isInArray([], 'test');
    expect(result).toBe(false);
  });

  test('returns true when element exists in array', () => {
    const result = isInArray(['a', 'b', 'c'], 'b');
    expect(result).toBe(true);
  });

  test('returns false when element does not exist in array', () => {
    const result = isInArray(['a', 'b', 'c'], 'd');
    expect(result).toBe(false);
  });
});

// Note: innerJoin function uses var instead of let, which makes it harder to test
// This would need refactoring to be fully testable as-is
