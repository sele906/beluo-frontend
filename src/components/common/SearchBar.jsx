import { BiSearch } from 'react-icons/bi';
import classes from './SearchBar.module.css';

function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className={classes.wrap}>
            <BiSearch className={classes.icon} />
            <input
                className={classes.input}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />
            {value && (
                <button className={classes.clearBtn} onClick={() => onChange('')}>✕</button>
            )}
        </div>
    );
}

export default SearchBar;
