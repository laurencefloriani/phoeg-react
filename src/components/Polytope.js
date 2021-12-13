import Select from 'react-select';
import React, {useState, useEffect} from "react";
import PolytopeChart from "./PolytopeChart.js";

let first_run = true;
const API_URL = "http://localhost:8080/endpoints"

// List of possible invariants
const INVARIANTS = [
    {value: "avcol", label: "avcol"},
];

// List of possible number of vertices
const NUMBERS = [
    {value : "1", label : "1"}
]

// List of possible colors
const COLORS = [
    {value: "mult", label: "mult"},
];

async function get_params() {
    //if (!first_run) return
    //first_run = false
    return await fetch(API_URL, {method: "GET"})
        .then(response => response.json())
        .then(data => [
            data.invariants.map(inv => ({value: inv.name, label: inv.name})),
            data.graph_sizes.map(size => ({value: size.toString(), label: size.toString()})),
            data.colors.map(color => ({value: color.name, label: color.name}))
        ])

}

// Component's core
export default function Polytope(props) {
    const [invariants, setInvariants] = useState(INVARIANTS);
    const [numbers, setNumbers] = useState(NUMBERS);
    const [colors, setColors] = useState(COLORS);

    const [invariant, setInvariant] = useState(INVARIANTS[0]);
    const [number, setNumber] = useState(NUMBERS[0]);
    const [color, setColor] = useState(COLORS[0]);
    const [submit, setSubmit] = useState(false);

    useEffect(() => {
        if (!first_run) return;
        first_run = false;
        get_params()
            .then(([inv, nbrs, colors]) => {
                setInvariants(inv);
                setInvariant(inv[0]);
                setNumbers(nbrs);
                setNumber(nbrs[0]);
                setColors(colors);
                setColor(colors[0]);
            })
    }, [])

    let currentInvariant = invariant.value;
    let currentNumber = number.value;
    let currentColor = color.value;

    const handleChangeInvariant = (newInvariant) => {
        setInvariant(newInvariant);
        currentInvariant = newInvariant.value;
        setSubmit(false);
        return true;
    }

    const handleChangeNumber = (newNumber) => {
        setNumber(newNumber);
        currentNumber = newNumber.value;
        setSubmit(false);
        return true;
    }

    const handleChangeMeasure = (newColor) => {
        setColor(newColor);
        currentColor = newColor.value;
        setSubmit(false);
        return true;
    }

    const clickSubmit = () => {
        setSubmit(true);
    }

    const RenderPolytopeChart = () => {
        if (submit) {
            return <PolytopeChart invariantName={currentInvariant} numberVertices={currentNumber} invariantColor={currentColor}/>;
        } else {
            return null;
        }
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
                        options={invariants}
                    />
                </label>
                <br/>
                <label>
                    Combien de sommet souhaitez-vous pour les graphes ?
                    <Select
                        defaultValue={number}
                        onChange={handleChangeNumber}
                        options={numbers}
                    />
                </label>
                <br/>
                <label>
                    Quelle mesure voulez-vous employer pour colorer les points ?
                    <Select
                        defaultValue={color}
                        onChange={handleChangeMeasure}
                        options={colors}/>
                </label>
            </form>
            <button onClick={clickSubmit}> Soumettre </button>
            <RenderPolytopeChart />
        </div>
    )
}