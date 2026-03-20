import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import classes from './CharacterCard.module.css';

function CharacterCard({ character, to, showTags = false, actions, avatarSize, className }) {
    const href = to ?? `character/${character.id}`;

    return (
        <div className={`${classes.card}${className ? ` ${className}` : ''}`}>
            <Link className={classes.link} to={href}>
                <div className={classes.imageWrap}>
                    <Avatar
                        filePath={character.characterImgUrl}
                        name={character.characterName}
                        imgClassName={classes.image}
                        card={true}
                        size={avatarSize}
                    />
                </div>
                <div className={classes.body}>
                    <span className={classes.name}>{character.characterName}</span>
                    {character.summary && (
                        <span className={classes.desc}>{character.summary}</span>
                    )}
                    {showTags && character.tag?.length > 0 && (
                        <div className={classes.tags}>
                            {character.tag.map((t) => (
                                <span key={t} className={classes.tag}>#{t}</span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
            {actions && (
                <div className={classes.actions}>
                    {actions}
                </div>
            )}
        </div>
    );
}

export default CharacterCard;
