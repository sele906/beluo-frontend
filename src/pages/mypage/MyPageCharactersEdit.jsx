import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCharacterDetail, updateCharacter } from "../../api/chatApi";
import { toast } from "sonner";
import { BiUpload } from "react-icons/bi";

import classes from "../create/Create.module.css";

function MyPageCharactersEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    characterName: "",
    summary: "",
    personality: "",
    firstMessage: "",
  });

  useEffect(() => {
    getCharacterDetail(id)
      .then((data) => {
        setForm({
          characterName: data.characterName ?? "",
          summary: data.summary ?? "",
          personality: data.personality ?? "",
          firstMessage: data.firstMessage ?? "",
        });
        setTags(data.tag ?? []);
        setIsPublic(data.isPublic ?? true);
        if (data.characterImgUrl) setPreview(data.characterImgUrl);
      })
      .catch((err) => {
        console.error("캐릭터 정보 불러오기 실패:", err);
        toast.error(err.response?.data || "캐릭터 정보를 불러오는데 실패했어요.");
        navigate("/mypage/characters");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

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

  const validate = () => {
    const newErrors = {};
    if (!form.characterName.trim()) {
      newErrors.characterName = "캐릭터 이름을 입력해주세요.";
    } else if (form.characterName.trim().length > 30) {
      newErrors.characterName = "이름은 30자 이하로 입력해주세요.";
    }
    if (!form.summary.trim()) {
      newErrors.summary = "캐릭터 요약을 입력해주세요.";
    } else if (form.summary.trim().length > 100) {
      newErrors.summary = "요약은 100자 이하로 입력해주세요.";
    }
    if (!form.personality.trim()) {
      newErrors.personality = "성격/설정을 입력해주세요.";
    } else if (form.personality.trim().length > 1000) {
      newErrors.personality = "성격/설정은 1000자 이하로 입력해주세요.";
    }
    if (!form.firstMessage.trim()) {
      newErrors.firstMessage = "첫 번째 메세지를 입력해주세요.";
    } else if (form.firstMessage.trim().length > 500) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    let pct = 0;
    const toastId = toast.loading("캐릭터 수정중.. 0%");
    const interval = setInterval(() => {
      pct = Math.min(pct + Math.floor(Math.random() * 8) + 3, 90);
      toast.loading(`캐릭터 수정중.. ${pct}%`, { id: toastId });
    }, 400);

    const characterData = {
      characterName: form.characterName,
      summary: form.summary,
      personality: form.personality,
      firstMessage: form.firstMessage,
      tag: tags,
      isPublic,
      characterImgUrl: preview,
    };

    const formData = new FormData();
    formData.append("character", new Blob([JSON.stringify(characterData)], { type: "application/json" }));
    if (fileObj) {
      formData.append("file", fileObj);
    }

    try {
      await updateCharacter(id, formData);
      clearInterval(interval);
      toast.loading("캐릭터 수정중.. 100%", { id: toastId });
      setTimeout(() => { toast.dismiss(toastId); navigate("/mypage/characters"); }, 300);
    } catch (err) {
      console.error("캐릭터 수정 실패:", err);
      clearInterval(interval);
      toast.dismiss(toastId);
      toast.error(err.response?.data || "저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className={classes.page}>
      <div className={classes.bgGlow} />

      <div className={classes.container}>

        <div className={classes.header}>
          <div className={classes.titleGroup}>
            <span className={classes.titleLabel}>EDIT CHARACTER</span>
            <h1 className={classes.title}>캐릭터 수정</h1>
          </div>
        </div>

        <hr />

        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.layout}>

            {/* 이미지 업로드 */}
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

            {/* 입력 필드 */}
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
                  value={form.characterName}
                  onChange={(e) => { setForm({ ...form, characterName: e.target.value }); clearError("characterName"); }}
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
                  value={form.summary}
                  onChange={(e) => { setForm({ ...form, summary: e.target.value }); clearError("summary"); }}
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
                  value={form.personality}
                  onChange={(e) => { setForm({ ...form, personality: e.target.value }); clearError("personality"); }}
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
                  value={form.firstMessage}
                  onChange={(e) => { setForm({ ...form, firstMessage: e.target.value }); clearError("firstMessage"); }}
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

export default MyPageCharactersEdit;
