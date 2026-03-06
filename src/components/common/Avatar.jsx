const getCloudinaryUrl = (url, size) => {
  if (!url || !size || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill/`);
};

const Avatar = ({ filePath, name, className, imgClassName, placeholderClassName, size }) => {

  if (filePath) {
    return (
      <img
        src={getCloudinaryUrl(filePath, size)}
        alt="avatar"
        className={imgClassName ?? className}  
      />
    );
  }

  if (placeholderClassName) {
    return (
      <div className={placeholderClassName}>
        {name?.charAt(0).toUpperCase()}
      </div>
    );
  }

  return <span>{name?.charAt(0).toUpperCase()}</span>;
};

export default Avatar;