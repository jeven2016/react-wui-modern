import React from "react";
import BaseSwitch from "./BaseSwitch";
import {IconChecked, IconUnChecked} from "./Icons";

function Checkbox(props) {
  return BaseSwitch({
    baseClassName: "checkbox",
    iconChecked: IconChecked,
    iconUnchecked: IconUnChecked,
    inputType: "checkbox",
    ...props
  });
}

Checkbox.defaultProps = {};

Checkbox.propTypes = {};

export default Checkbox;