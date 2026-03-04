const Avatar = ({ filePath, name, className, imgClassName, placeholderClassName }) => {
  if (filePath) {
    return (
      <img
        src={`http://localhost:8080/fileupload${filePath}`}
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