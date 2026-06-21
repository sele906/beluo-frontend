import { useState, useEffect } from "react";
import { enableNotification, disableNotification } from "../api/firebase";
import { toast } from "sonner";

export default function useNotificationToggle() {
    const [isOn, setIsOn] = useState(Notification.permission === "granted");

    const toggle = async() => {
        if (Notification.permission === "denied") {
            toast.error("브라우저 설정에서 알림 권한을 허용해주세요.");
            return;
        }

        if (isOn) {
            const ok = await disableNotification();
            if (ok) {
                setIsOn(false);
                toast.info("이 기기에서 알림을 해제했어요.");
            }
        } else {
            const res = await enableNotification();
            if (res) {
                setIsOn(true);
                toast.info("이 기기에서 알림을 받아요.");
            } else {
                toast.error("알림 권한이 필요해요.");
            }
        }
    };

    return { isOn, toggle };
}