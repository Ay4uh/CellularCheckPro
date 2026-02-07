import React, { createContext, useState, useContext } from 'react';
import { TestOrder } from '../utils/TestOrder';

type TestResult = 'pending' | 'success' | 'failure' | 'skipped';

interface TestContextType {
    results: { [key: string]: TestResult };
    setResult: (testId: string, result: TestResult) => void;
    clearResults: () => void;
    isAutomated: boolean;
    currentIndex: number;
    startAutomatedTest: () => void;
    markTestAndGoNext: (testId: string, result: TestResult, navigation: any) => void;
    cancelAutomatedTest: () => void;
}

const TestContext = createContext<TestContextType>({
    results: {},
    setResult: () => { },
    clearResults: () => { },
    isAutomated: false,
    currentIndex: -1,
    startAutomatedTest: () => { },
    markTestAndGoNext: () => { },
    cancelAutomatedTest: () => { },
});

export const TestProvider = ({ children }: { children: React.ReactNode }) => {
    const [results, setResults] = useState<{ [key: string]: TestResult }>({});
    const [isAutomated, setIsAutomated] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const setResult = (testId: string, result: TestResult) => {
        setResults(prev => ({ ...prev, [testId]: result }));
    };

    const clearResults = () => {
        setResults({});
        setIsAutomated(false);
        setCurrentIndex(-1);
    };

    const startAutomatedTest = () => {
        setResults({});
        setIsAutomated(true);
        setCurrentIndex(0);
    };

    const markTestAndGoNext = (testId: string, result: TestResult, navigation: any) => {
        setResult(testId, result);

        if (isAutomated) {
            const nextIndex = currentIndex + 1;
            if (nextIndex < TestOrder.length) {
                setCurrentIndex(nextIndex);
                navigation.navigate(TestOrder[nextIndex].route);
            } else {
                setIsAutomated(false);
                setCurrentIndex(-1);
                navigation.navigate('Report');
            }
        } else {
            navigation.navigate('DashboardMain');
        }
    };

    const cancelAutomatedTest = () => {
        setIsAutomated(false);
        setCurrentIndex(-1);
    };

    return (
        <TestContext.Provider value={{
            results, setResult, clearResults,
            isAutomated, currentIndex,
            startAutomatedTest, markTestAndGoNext, cancelAutomatedTest
        }}>
            {children}
        </TestContext.Provider>
    );
};

export const useTestContext = () => useContext(TestContext);
