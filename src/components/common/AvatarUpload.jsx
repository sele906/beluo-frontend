import { useRef, useState } from 'react';
import { BiUpload } from 'react-icons/bi';
import { toast } from 'sonner';
import classes from './AvatarUpload.module.css';

function AvatarUpload({ preview, onChange, fallback, overlayContent, size = 80 }) {
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("파일 크기는 10MB 이하여야 합니다.");
            return;
        }
        onChange(file);
    };

    return (
        <div className={classes.wrap}>
            <div
                style={{ width: size, height: size }}
                className={`${classes.clickable} ${dragging ? classes.dragging : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            >
                {preview
                    ? <img src={preview} alt="avatar" className={classes.img} />
                    : fallback
                }
                <div className={classes.overlay}>
                    {overlayContent ?? <><BiUpload size={18} /><span>변경</span></>}
                </div>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={classes.fileInput}
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    );
}

export default AvatarUpload;
