import React, { useEffect, useState } from "react";
import { readGraph } from "../core/ParseFiles";
import GraphSlider from "./GraphSlider";

export default function Graphs(props) {
    const [graphlist, setGraphList] = useState(["@"]); // La liste des graphes correspondant aux critères
    const [computedList, setComputedList] = useState(false);

    useEffect( () => {
        const graphPath = props.graphPath.value.path;
        let graphs_request = new URL(`http://localhost:8080${graphPath}`);
        graphs_request.searchParams.append("max_graph_size", props.numberVertices);
        graphs_request.searchParams.append("invariants", props.invariantXName);
        graphs_request.searchParams.append("invariants", props.invariantYName);

        // Filter for specific invariant values
        graphs_request.searchParams.append(props.invariantXName, props.invariantXValue);
        graphs_request.searchParams.append(props.invariantYName, props.invariantYValue);

        let pathGraph = "assets/data_" + props.invariantXName + "/graphes/graphes-" + props.numberVertices + ".json";
        fetch(graphs_request.toString(), {headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}})
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                // let temp = readGraph(myJson, props.numberEdges, props.invariantXName, props.invariantValue);
                let temp = myJson.sig; // Get the list of signatures
                if (temp !== null) {
                    setGraphList(temp);
                    setComputedList(true);
                } else {
                    setComputedList(false);
                }
            })
    }, [props.invariantXName, props.invariantXValue, props.numberVertices, props.invariantYValue] );

    const RenderGraphSlider = () => {
        if (computedList) {
            return <GraphSlider graphList={graphlist}/>;
        } else {
            return null;
        }
    }

    return (
        <div className="graphs">
            <h2 className="graphs-title">Graphe(s)</h2>
            <p> Nom de l'invariant : {props.invariantXName} | Nombre d'arêtes : {props.invariantYValue} | Nombre de sommets : {props.numberVertices} | Valeur de l'invariant : {props.invariantXValue} </p>
            <RenderGraphSlider />
        </div>
    );
}