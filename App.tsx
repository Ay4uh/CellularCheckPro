/**
 * Cellular Check Pro
 * Hardware Diagnostic App
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

import { TestProvider } from './src/context/TestContext';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <TestProvider>
        <AppNavigator />
      </TestProvider>
    </SafeAreaProvider>
  );
};

export default App;
