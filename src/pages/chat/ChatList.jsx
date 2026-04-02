import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { BiMessageDetail, BiChevronRight } from "react-icons/bi";
import { getConversationList } from "../../api/chatApi";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll";
import Avatar from "../../components/common/Avatar";
import SearchBar from "../../components/common/SearchBar";

import classes from "./ChatList.module.css";

function ChatList() {
    const [conversationList, setConversationList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);

    useEffect(() => {
        async function fetchConversations() {
            try {
                const data = await getConversationList();
                setConversationList(data.conversations);
                setHasMore(data.hasMore);
                setNextCursor(data.nextCursor);
            } catch (error) {
                console.error("대화 목록 불러오기 실패:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchConversations();
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const data = await getConversationList(nextCursor);
            setConversationList((prev) => [...prev, ...data.conversations]);
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
        } catch (error) {
            console.error("대화 목록 추가 불러오기 실패:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, nextCursor]);

    const sentinelRef = useInfiniteScroll(loadMore);

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
            <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder="대화 또는 캐릭터 이름 검색..."
            />

            {/* 목록 */}
            <div className={classes.list}>
                {isLoading ? (
                    <div className={classes.loader}>
                        <span className={classes.loadingDots}><span /><span /><span /></span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={classes.empty}>
                        <BiMessageDetail className={classes.emptyIcon} />
                        <p>{searchValue ? "검색 결과가 없어요" : "아직 대화가 없어요"}</p>
                    </div>
                ) : filtered.map((c) => (
                        <Link
                            key={c.sessionId}
                            to={`/chat/${c.sessionId}`}
                            title={c.characterName}
                            className={classes.item}
                        >
                            {/* 아바타 */}
                            <div className={classes.avatar}>
                                <Avatar
                                    filePath={c.characterImgUrl}
                                    name={c.characterName}
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
                ))}

                {/* 무한 스크롤 sentinel */}
                {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
            </div>

            {/* 추가 로딩 인디케이터 */}
            {isLoadingMore && (
                <div className={classes.loader}>
                    <span className={classes.loadingDots}><span /><span /><span /></span>
                </div>
            )}

        </div>
    );
}

export default ChatList;
