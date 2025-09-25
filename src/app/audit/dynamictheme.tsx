import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { makeStyles } from '@mui/styles';
import theme1Icon from "./svg/svg1.svg";
import theme2Icon from "./svg/svg2.svg";
import theme3Icon from "./svg/svg3.svg";
import theme4Icon from "./svg/svg4.svg";
import theme5Icon from "./svg/svg5.svg";
import { InputLabel } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {},
  circleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  circle: {
    borderRadius: '50%',
    border: '2px solid transparent',
    padding: '6px',
    width: '56px',
    height: '56px',
    margin: '0 5px',
    cursor: 'pointer',
  },
  selectedCircle: {
    border: '2px dashed black',
    width: '45px',
    height: '45px',
    padding: '1px',
  },
}));

const DynamicTheme = () => {
  const { themed, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(() => localStorage.getItem('selectedTheme') || null);
  const classes = useStyles();

  useEffect(() => {
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  }, [selectedTheme, setTheme]);

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    setSelectedTheme(theme);
    localStorage.setItem('selectedTheme', theme);
  };

  const getCircleStyle = (themeName: string) => {
    return `${classes.circle} ${selectedTheme === themeName ? classes.selectedCircle : ''}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className={classes.circleContainer}>
      <InputLabel
        id="themeSelector-label"
        style={{fontWeight: 'bold' }}
      >
        Theme:-
      </InputLabel>
        <div className={getCircleStyle('theme1')} onClick={() => handleThemeChange('theme1')}>
          <img src={theme1Icon} alt="Theme 1" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className={getCircleStyle('theme2')} onClick={() => handleThemeChange('theme2')}>
          <img src={theme2Icon} alt="Theme 2" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className={getCircleStyle('theme3')} onClick={() => handleThemeChange('theme3')}>
          <img src={theme3Icon} alt="Theme 3" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className={getCircleStyle('theme4')} onClick={() => handleThemeChange('theme4')}>
          <img src={theme4Icon} alt="Theme 4" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className={getCircleStyle('theme5')} onClick={() => handleThemeChange('theme5')}>
          <img src={theme5Icon} alt="Theme 5" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default DynamicTheme;
