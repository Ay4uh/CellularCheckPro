import { useNavigation } from '@react-navigation/native';
import { useTestContext } from '../context/TestContext';
import { Alert } from 'react-native';

export const useTestLogic = (testId: string) => {
    const navigation = useNavigation<any>();
    const { markTestAndGoNext, isAutomated, currentIndex } = useTestContext();

    const completeTest = (status: 'success' | 'failure' | 'skipped', extra?: any) => {
        if (isAutomated) {
            markTestAndGoNext(testId, status, navigation, extra);
        } else {
            markTestAndGoNext(testId, status, navigation, extra);
            Alert.alert(
                `Test ${status === 'success' ? 'Passed' : status === 'skipped' ? 'Skipped' : 'Failed'}`,
                'Result saved.',
                [{ text: 'OK' }]
            );
        }
    };

    return { completeTest, isAutomated, currentIndex };
};
