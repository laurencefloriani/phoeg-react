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
    return await fetch(API_URL, {method: "GET"})
        .then(response => response.json())
        .then(data => {
            const endpoints = []
            for (const endpt in data.endpoints) {
                if (data.endpoints.hasOwnProperty(endpt)) {
                    endpoints.push(data.endpoints[endpt])
                }
            }
            return [
                endpoints.map(endpt => ({value: endpt, label: endpt.name})),
                data.invariants.map(inv => ({value: inv.name, label: inv.name})),
                data.graph_sizes.map(size => ({value: size.toString(), label: size.toString()})),
                data.colors.map(color => ({value: color.name, label: color.name}))
            ]
        })
}

function getDefaultValue(type) {
    switch (type) {
        case "number":
            return 0;
        case "string":
            return "";
        default:
            console.error("Type " + type + " not supported.");
            return null;
    }
}

// Component's core
export default function Polytope(props) {
    const [endpoints, setEndpoints] = useState([]); // No endpoints by default, then query from API
    const [endpoint, setEndpoint] = useState(null);

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
            .then(([endpoints, inv, nbrs, colors]) => {
                console.debug([endpoints, inv, nbrs, colors]);
                setEndpoints(endpoints);
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

    const handleChangePolytopType = (newPolytopType) => {
        console.log(newPolytopType);
        setEndpoint(newPolytopType);
        setSubmit(false);
        return true;
    }

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

    const RenderOneQuestion = (label, defaultValue, onChange, options) => {
        return (
            <label>
                {label}
                <Select
                    //defaultValue={defaultValue}
                    onChange={onChange}
                    options={options}
                />
            </label>
        );
    }

    const parseQuestion = (props, question) => {
        let options = []
        const properties = props[question];
        if (properties.hasOwnProperty("anyOf")) {
            properties.anyOf.forEach(item => {
                const possible_value = item.const;
                const type = item.type;
                options.push(possible_value);
            })
            return [properties.toString(), options[0], null, options]; // todo options[0] ? len : ""
        } else if (properties.hasOwnProperty("type")) {
            const defaultValue = getDefaultValue(properties.type);
            return [properties.toString(), defaultValue, null, null];
        } else {
            console.error("Could not parse " + properties);
            return null;
        }
    }

    const RenderMultipleQuestions = () => {
        let allQuestions = [];
        endpoints.forEach(endpoint => {
            const props = endpoint.params.properties
            for (const question in props) {
                if (props.hasOwnProperty(question)) {
                    const [label, defaultValue, onChange, options] = parseQuestion(props, question);
                    allQuestions.push(RenderOneQuestion(
                        RenderOneQuestion(label, defaultValue, onChange, options)
                    ));
                }
            }
            allQuestions.push(<br/>)
        })
        return allQuestions;
    }

    return (
        <div>
            <h3> Polytope {props.num}</h3>
            <form>
                <label>
                    Quel type de polytopes souhaitez-vous étudier ?
                    <Select
                        //defaultValue={endpoints}
                        onChange={handleChangePolytopType}
                        options={endpoints}
                    />
                </label>
            </form>
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