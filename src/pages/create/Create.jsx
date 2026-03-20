import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter } from "../../api/chatApi";
import { toast } from "sonner";
import { BiUpload } from "react-icons/bi";

import classes from "./Create.module.css";

function Create() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    setFileObj(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  //파일 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formElements = e.target.elements;

    const characterData = {
      characterName: formElements.characterName.value,
      summary: formElements.summary.value,
      personality: formElements.personality.value,
      firstMessage: formElements.firstMessage.value,
      tag: tags,
      isPublic,
    };

    const formData = new FormData();
    formData.append("character", new Blob([JSON.stringify(characterData)], { type: "application/json" }));
    if (fileObj) {
      formData.append("file", fileObj);
    }

    try {
      const id = await createCharacter(formData);
      navigate(`/character/${id}`); // 생성 후 이동 (경로 맞게 수정)
    } catch (err) {
      console.error("캐릭터 생성 실패:", err);
      toast.error("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.page}>
      {/* 배경 효과 */}
      <div className={classes.bgGlow} />

      <div className={classes.container}>

        {/* 헤더 */}
        <div className={classes.header}>
          <div className={classes.titleGroup}>
            <span className={classes.titleLabel}>NEW CHARACTER</span>
            <h1 className={classes.title}>캐릭터 만들기</h1>
          </div>
        </div>

        <hr/>

        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.layout}>

            {/* 왼쪽: 이미지 업로드 */}
            <div className={classes.left}>
              <div
                className={`${classes.dropzone} ${dragging ? classes.dragging : ""} ${preview ? classes.hasPreview : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview" className={classes.previewImg} />
                    <div className={classes.previewOverlay}><span>이미지 변경</span></div>
                  </>
                ) : (
                  <div className={classes.dropzoneContent}>
                    <div className={classes.uploadIcon}>
                      <BiUpload size={32} />
                    </div>
                    <p className={classes.dropzoneText}>이미지 업로드</p>
                    <p className={classes.dropzoneHint}>클릭하거나 드래그하세요<br />JPG, PNG, WEBP</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={classes.fileInput}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
              </div>
            </div>

            {/* 오른쪽: 입력 필드 */}
            <div className={classes.right}>
              <div className={classes.field}>
                <label className={classes.label} htmlFor="characterName">
                  <span className={classes.labelDot} />
                  캐릭터 이름
                </label>
                <input
                  id="characterName"
                  name="characterName"
                  type="text"
                  className={classes.input}
                  placeholder="캐릭터 이름을 입력하세요"
                />
              </div>

              <div className={classes.field}>
                <label className={classes.label} htmlFor="summary">
                  <span className={classes.labelDot} />
                  캐릭터 요약
                </label>
                <input
                  id="summary"
                  name="summary"
                  type="text"
                  className={classes.input}
                  placeholder="한 줄로 캐릭터를 소개하세요"
                />
              </div>

              <div className={classes.field}>
                <label className={classes.label} htmlFor="personality">
                  <span className={classes.labelDot} />
                  성격 / 설정
                </label>
                <textarea
                  id="personality"
                  name="personality"
                  className={`${classes.input} ${classes.textarea}`}
                  placeholder="캐릭터의 성격, 배경, 말투 등을 자세히 설명해주세요"
                  rows={5}
                />
              </div>

              <div className={classes.field}>
                <label className={classes.label} htmlFor="firstMessage">
                  <span className={classes.labelDot} />
                  첫 번째 메세지
                </label>
                <textarea
                  id="firstMessage"
                  name="firstMessage"
                  className={`${classes.input} ${classes.textarea}`}
                  placeholder="대화 시작 시 캐릭터가 보낼 첫 메세지"
                  rows={3}
                />
              </div>

              {/* 태그 */}
              <div className={classes.field}>
                <label className={classes.label}>
                  <span className={classes.labelDot} />
                  태그
                </label>
                <div className={classes.tagBox}>
                  {tags.map((tag, i) => (
                    <span key={i} className={classes.tag}>
                      #{tag}
                      <button type="button" className={classes.tagRemove} onClick={() => removeTag(i)}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className={classes.tagInput}
                    placeholder={tags.length === 0 ? "태그 입력 후 Enter" : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
                <input type="hidden" name="tags" value={JSON.stringify(tags)} />
              </div>

              {/* 공개 여부 */}
              <div className={classes.field}>
                <label className={classes.label}>
                  <span className={classes.labelDot} />
                  공개 여부
                </label>
                <div className={classes.toggleRow}>
                  <div className={classes.toggleLabel}>
                    <span className={classes.toggleTitle}>{isPublic ? "공개" : "비공개"}</span>
                    <span className={classes.toggleDesc}>{isPublic ? "모든 사용자가 이 캐릭터를 볼 수 있습니다" : "나만 이 캐릭터를 볼 수 있습니다"}</span>
                  </div>
                  <label className={classes.toggle}>
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                    <span className={classes.toggleSlider} />
                  </label>
                </div>
              </div>

              <button type="submit" className={classes.submitBtn} disabled={isSubmitting}>
                <span>{isSubmitting ? "저장 중..." : "저장하기"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Create;
