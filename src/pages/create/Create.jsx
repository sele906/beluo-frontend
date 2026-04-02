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
  const [errors, setErrors] = useState({});

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

  const validate = (elements) => {
    const newErrors = {};
    if (!elements.characterName.value.trim()) {
      newErrors.characterName = "캐릭터 이름을 입력해주세요.";
    } else if (elements.characterName.value.trim().length > 30) {
      newErrors.characterName = "이름은 30자 이하로 입력해주세요.";
    }
    if (!elements.summary.value.trim()) {
      newErrors.summary = "캐릭터 요약을 입력해주세요.";
    } else if (elements.summary.value.trim().length > 100) {
      newErrors.summary = "요약은 100자 이하로 입력해주세요.";
    }
    if (!elements.personality.value.trim()) {
      newErrors.personality = "성격/설정을 입력해주세요.";
    } else if (elements.personality.value.trim().length > 1000) {
      newErrors.personality = "성격/설정은 1000자 이하로 입력해주세요.";
    }
    if (!elements.firstMessage.value.trim()) {
      newErrors.firstMessage = "첫 번째 메세지를 입력해주세요.";
    } else if (elements.firstMessage.value.trim().length > 500) {
      newErrors.firstMessage = "첫 번째 메세지는 500자 이하로 입력해주세요.";
    }
    return newErrors;
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= 10) {
        toast.error("태그는 최대 10개까지 추가할 수 있습니다.");
        return;
      }
      if (tagInput.trim().length > 20) {
        toast.error("태그는 20자 이하로 입력해주세요.");
        return;
      }
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
  const LOADING_MESSAGES = [
    "캐릭터 만드는중..",
    "캐릭터에 감정 넣는중..",
    "개성 불어넣는중..",
    "말투 설정하는중..",
    "성격 다듬는중..",
    "버릇 추가하는중..",
    "매력 포인트 찾는중..",
    "취향 설정하는중.."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formElements = e.target.elements;
    const newErrors = validate(formElements);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    let lastIdx = -1;
    const pickRandom = () => {
      let idx;
      do { idx = Math.floor(Math.random() * LOADING_MESSAGES.length); } while (idx === lastIdx);
      lastIdx = idx;
      return LOADING_MESSAGES[idx];
    };

    const toastId = toast.loading(pickRandom());
    const interval = setInterval(() => {
      toast.loading(pickRandom(), { id: toastId });
    }, 2500);

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
      clearInterval(interval);
      toast.dismiss(toastId);
      navigate(`/character/${id}`); 
    } catch (err) {
      console.error("캐릭터 생성 실패:", err);
      clearInterval(interval);
      toast.dismiss(toastId);
      toast.error(err.response?.data || "저장에 실패했어요. 다시 시도해주세요.");
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
                  className={`${classes.input} ${errors.characterName ? classes.inputError : ""}`}
                  placeholder="캐릭터 이름을 입력하세요"
                  onChange={() => clearError("characterName")}
                />
                {errors.characterName && <span className={classes.errorMsg}>{errors.characterName}</span>}
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
                  className={`${classes.input} ${errors.summary ? classes.inputError : ""}`}
                  placeholder="한 줄로 캐릭터를 소개하세요"
                  onChange={() => clearError("summary")}
                />
                {errors.summary && <span className={classes.errorMsg}>{errors.summary}</span>}
              </div>

              <div className={classes.field}>
                <label className={classes.label} htmlFor="personality">
                  <span className={classes.labelDot} />
                  성격 / 설정
                </label>
                <textarea
                  id="personality"
                  name="personality"
                  className={`${classes.input} ${classes.textarea} ${errors.personality ? classes.inputError : ""}`}
                  placeholder="캐릭터의 성격, 배경, 말투 등을 자세히 설명해주세요"
                  rows={5}
                  onChange={() => clearError("personality")}
                />
                {errors.personality && <span className={classes.errorMsg}>{errors.personality}</span>}
              </div>

              <div className={classes.field}>
                <label className={classes.label} htmlFor="firstMessage">
                  <span className={classes.labelDot} />
                  첫 번째 메세지
                </label>
                <textarea
                  id="firstMessage"
                  name="firstMessage"
                  className={`${classes.input} ${classes.textarea} ${errors.firstMessage ? classes.inputError : ""}`}
                  placeholder="대화 시작 시 캐릭터가 보낼 첫 메세지"
                  rows={3}
                  onChange={() => clearError("firstMessage")}
                />
                {errors.firstMessage && <span className={classes.errorMsg}>{errors.firstMessage}</span>}
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
