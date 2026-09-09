const fs = require('fs');
const path = require('path');

const {
  DEV_SMOKE_TEST_STEPS,
  V2_TAB_ROUTES,
} = require('../src/dev/smokeTestConfig');

function screenNames(source, component) {
  const expression = new RegExp(`<${component}\\.Screen\\s+name=["']([^"']+)["']`, 'g');
  return new Set(Array.from(source.matchAll(expression), (match) => match[1]));
}

describe('BUEPT V2 navigation contract', () => {
  const rootSource = fs.readFileSync(
    path.join(__dirname, '../src/navigation/RootNavigator.js'),
    'utf8',
  );
  const tabSource = fs.readFileSync(
    path.join(__dirname, '../src/navigation/TabNavigator.js'),
    'utf8',
  );
  const stackRoutes = screenNames(rootSource, 'Stack');
  const tabRoutes = screenNames(tabSource, 'Tab');

  test('primary navigation contains only the five V2 areas', () => {
    expect([...tabRoutes]).toEqual(V2_TAB_ROUTES);
  });

  test('smoke test tab routes all exist in the V2 tab navigator', () => {
    const smokeTabs = DEV_SMOKE_TEST_STEPS
      .filter((step) => step.type === 'tab')
      .map((step) => step.screen);
    smokeTabs.forEach((screen) => expect(tabRoutes.has(screen)).toBe(true));
  });

  test('smoke test stack routes are registered', () => {
    const smokeStack = DEV_SMOKE_TEST_STEPS
      .filter((step) => step.type === 'stack')
      .map((step) => step.name);
    smokeStack.forEach((screen) => expect(stackRoutes.has(screen)).toBe(true));
  });

  test('legacy eight-tab names do not return as tabs', () => {
    ['Home', 'Reading', 'Grammar', 'Writing', 'Vocab', 'Listening', 'Speaking', 'Settings']
      .forEach((legacy) => expect(tabRoutes.has(legacy)).toBe(false));
  });
});
