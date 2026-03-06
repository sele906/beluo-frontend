import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BiSearch, BiMessageDetail, BiChevronRight } from "react-icons/bi";
import { getConversationList } from "../../api/chatApi";
import Avatar from "../../components/common/Avatar";

import classes from "./ChatList.module.css";

function ChatList() {
    const [conversationList, setConversationList] = useState([]);
    const [searchValue, setSearchValue] = useState("");

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

    const filtered = conversationList.filter((c) =>
        c.conversationName.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.characterName.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div className={classes.container}>

            <div className={classes.titleRow}>
                <h2 className={classes.title}>채팅 목록</h2>
            </div>

            {/* 검색 */}
            <div className={classes.searchBar}>
                <BiSearch className={classes.searchIcon} />
                <input
                    className={classes.searchInput}
                    type="text"
                    placeholder="대화 또는 캐릭터 이름 검색..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchValue && (
                    <button className={classes.clearBtn} onClick={() => setSearchValue("")}>✕</button>
                )}
            </div>

            {/* 목록 */}
            <div className={classes.list}>
                {filtered.length === 0 ? (
                    <div className={classes.empty}>
                        <BiMessageDetail className={classes.emptyIcon} />
                        <p>{searchValue ? "검색 결과가 없어요" : "아직 대화가 없어요"}</p>
                    </div>
                ) : (
                    filtered.map((c) => (
                        <Link
                            key={c.sessionId}
                            to={`/chat?sessionId=${c.sessionId}`}
                            title={c.characterName}
                            className={classes.item}
                        >
                            {/* 아바타 */}
                            <div className={classes.avatar}>
                                <Avatar
                                    filePath={c.characterImgUrl}
                                    name={c.characterName}
                                    className={classes.avatarImg}
                                    size={200}
                                />
                            </div>

                            {/* 텍스트 */}
                            <div className={classes.info}>
                                <span className={classes.chatName}>{c.conversationName}</span>
                                <span className={classes.charName}>{c.characterName}</span>
                            </div>

                            {/* 화살표 */}
                            <span className={classes.arrow}><BiChevronRight /></span>
                        </Link>
                    ))
                )}
            </div>

        </div>
    );
}

export default ChatList;
