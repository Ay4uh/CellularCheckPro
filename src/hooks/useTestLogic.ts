import { useNavigation } from '@react-navigation/native';
import { useTestContext } from '../context/TestContext';
import { Alert } from 'react-native';

export const useTestLogic = (testId: string) => {
    const navigation = useNavigation<any>();
    const { markTestAndGoNext, isAutomated, currentIndex } = useTestContext();

    const completeTest = (status: 'success' | 'failure' | 'skipped') => {
        if (isAutomated) {
            markTestAndGoNext(testId, status, navigation);
        } else {
            markTestAndGoNext(testId, status, navigation);
            Alert.alert(
                `Test ${status === 'success' ? 'Passed' : status === 'skipped' ? 'Skipped' : 'Failed'}`,
                'Result saved.',
                [{ text: 'OK' }]
            );
        }
    };

    return { completeTest, isAutomated, currentIndex };
};
