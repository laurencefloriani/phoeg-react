import Select from 'react-select';
import React, {useState} from "react";
import $ from "jquery";
import { Scatter } from 'react-chartjs-2';
import {readEnvelope, readPoints} from "../core/ParseFiles";
import PolytopeChart from "./PolytopeChart";

// List of invariants possible
const INVARIANTS = [
    {value: "avcol", label: "avcol"},
    {value: "eci", label: "eci"},
    {value: "numcol", label: "numcol"}
];

// List of number vertices possible
const NUMBERS = [
    {value : "2", label : "2"},
    {value : "3", label : "3"},
    {value : "4", label : "4"},
    {value : "5", label : "5"},
    {value : "6", label : "6"},
    {value : "7", label : "7"},
    {value : "8", label : "8"},
    {value : "9", label : "9"},
]

// List of possible colors
const COLORS = [
    {value: "mult", label: "mult"},
    {value: "chi", label: "chi"}
];

// Component's core
export default function Polytope(props) {
    const [invariant, setInvariant] = useState(INVARIANTS[0]);
    const [number, setNumber] = useState(NUMBERS[0]);
    const [color, setColor] = useState(COLORS[0]);

    let currentInvariant = invariant.value;
    let currentNumber = number.value;
    let currentColor = color.value;

    const handleChangeInvariant = (newInvariant) => {
        setInvariant(newInvariant);
        currentInvariant = newInvariant.value;
        return true;
    }

    const handleChangeNumber = (newNumber) => {
        setNumber(newNumber);
        currentNumber = newNumber.value;
        return true;
    }

    const handleChangeMeasure = (newColor) => {
        setColor(newColor);
        currentColor = newColor.value;
        return true;
    }

    return (
        <div>
            <h3> Polytope {props.num}</h3>
            <form>
                <label>
                    Quel invariant souhaitez-vous étudier ?
                    <Select
                        defaultValue={invariant}
                        onChange={handleChangeInvariant}
                        options={INVARIANTS}
                    />
                </label>
                <br/>
                <label>
                    Combien de sommet souhaitez-vous pour les graphes ?
                    <Select
                        defaultValue={number}
                        onChange={handleChangeNumber}
                        options={NUMBERS}
                    />
                </label>
                <br/>
                <label>
                    Quelle mesure voulez-vous employer pour colorer les points ?
                    <Select
                        defaultValue={color}
                        onChange={handleChangeMeasure}
                        options={COLORS}/>
                </label>
                <PolytopeChart invariant={currentInvariant} number={currentNumber} color={currentColor}/>
            </form>
        </div>
    )
}