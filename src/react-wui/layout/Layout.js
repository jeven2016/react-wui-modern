import React from 'react';
import Header from './Header';
import clsx from 'clsx';
import Slider from './Slider';
import Content from './Content';
import Split from './Split';
import Footer from './Footer';

const Layout = React.forwardRef((props, ref) => {
  const {
    className = 'layout',
    extraClassName,
    ...otherProps
  } = props;
  let clsName = clsx(extraClassName, className);

  return <div className={clsName} {...otherProps}/>;
});

Layout.Header = Header;
Layout.Slider = Slider;
Layout.Content = Content;
Layout.Split = Split;
Layout.Footer = Footer;

export default Layout;