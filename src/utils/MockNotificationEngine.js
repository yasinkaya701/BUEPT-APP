import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_KEY = '@buept_notif_seen';

export const triggerBootNotification = async (academicFocus) => {
    try {
        const hasSeen = await AsyncStorage.getItem(NOTIF_KEY);
        if (!hasSeen) {
            // Wait 3 seconds after boot
            setTimeout(async () => {
                let message = "Welcome to BUEPT App! Your diagnostic test is waiting.";
                if (academicFocus === 'Engineering') {
                    message = "Engineering Faculty: New technical reading modules are available.";
                } else if (academicFocus === 'Economics') {
                    message = "Economics Faculty: A new macroeconomics assignment is pending.";
                }

                Alert.alert("🔔 Campus Update", message, [{ text: "View" }]);
                await AsyncStorage.setItem(NOTIF_KEY, 'true');
            }, 3000);
        }
    } catch (e) {
        // ignore
    }
};

export const resetNotifications = async () => {
    await AsyncStorage.removeItem(NOTIF_KEY);
};
