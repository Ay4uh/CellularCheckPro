import React, { createContext, useState, useContext } from 'react';
import { TestOrder } from '../utils/TestOrder';

type TestResult = 'pending' | 'success' | 'failure' | 'skipped';

interface TestContextType {
    results: { [key: string]: TestResult };
    extraData: { [key: string]: any };
    setResult: (testId: string, result: TestResult, extra?: any) => void;
    clearResults: () => void;
    isAutomated: boolean;
    currentIndex: number;
    startAutomatedTest: () => void;
    markTestAndGoNext: (testId: string, result: TestResult, navigation: any, extra?: any) => void;
    cancelAutomatedTest: () => void;
}

const TestContext = createContext<TestContextType>({
    results: {},
    extraData: {},
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
    const [extraData, setExtraData] = useState<{ [key: string]: any }>({});
    const [isAutomated, setIsAutomated] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const setResult = (testId: string, result: TestResult, extra?: any) => {
        setResults(prev => ({ ...prev, [testId]: result }));
        if (extra) {
            setExtraData(prev => ({ ...prev, [testId]: extra }));
        }
    };

    const clearResults = () => {
        setResults({});
        setExtraData({});
        setIsAutomated(false);
        setCurrentIndex(-1);
    };

    const startAutomatedTest = () => {
        setResults({});
        setExtraData({});
        setIsAutomated(true);
        setCurrentIndex(0);
    };

    const markTestAndGoNext = (testId: string, result: TestResult, navigation: any, extra?: any) => {
        setResult(testId, result, extra);

        if (isAutomated) {
            let nextIndex = currentIndex + 1;
            // Skip non-test screens like Storage if they are in the list
            while (nextIndex < TestOrder.length && TestOrder[nextIndex].id === 'Storage') {
                nextIndex++;
            }

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
            results, extraData, setResult, clearResults,
            isAutomated, currentIndex,
            startAutomatedTest, markTestAndGoNext, cancelAutomatedTest
        }}>
            {children}
        </TestContext.Provider>
    );
};

export const useTestContext = () => useContext(TestContext);
