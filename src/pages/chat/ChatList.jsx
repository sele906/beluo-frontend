import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getConversationList } from "../../api/chatApi";

function ChatList() {

    const [conversationList, setConversationList] = useState([]);

    useEffect(() => {
        async function fetchConversations() {
            try {
                const data = await getConversationList();
                setConversationList(data);
            } catch (error) {
                console.error("대화 목록 불러오기 실패:", error);
            }
        }

        fetchConversations();
    }, []);

    return (
        <>
            <h3>ChatList</h3>

            <div className="recentConversations">
                {conversationList.map((c) => 
                    <p key={c.sessionId}> 
                        <Link to={`/chat?sessionId=${c.sessionId}&chatName=${c.conversationName}`} title={c.characterName}>{c.conversationName}</Link>
                    </p>
                )}
            </div>
        </>
    );
}

export default ChatList;

