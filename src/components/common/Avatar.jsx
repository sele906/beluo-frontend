import classes from "./Avatar.module.css";

const getCloudinaryUrl = (url, size) => {
  if (!url || !size || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`);
};

const Avatar = ({ filePath, name, className, imgClassName, size, card }) => {

  if (filePath) {
    return (
      <img
        src={getCloudinaryUrl(filePath, size)}
        alt="avatar"
        className={imgClassName ?? className ?? classes.img}
      />
    );
  }

  if (card) {
    return (
      <div className={classes.cardPlaceholder}>
        {name?.charAt(0).toUpperCase()}
      </div>
    );
  } else {
    return (
      <div className={classes.placeholder}>
        {name?.charAt(0).toUpperCase()}
      </div>
    );
  }

  
};

export default Avatar;