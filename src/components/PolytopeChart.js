import {readEnvelope, readPoints} from "../core/ParseFiles";
import React, {useEffect, useState} from "react";
import {Bubble} from "react-chartjs-2";
import 'chartjs-plugin-zoom';
import Graphs from "./Graphs";

export default function PolytopeChart(props) {
    const [data, setData] = useState({datasets: [
            {type: 'bubble', data: [{x: 0, y: 0, r: 5}]},
            {type: 'line', data: [{x: 0, y: 0}]}
        ]});
    const [invariantYValue, setInvariantYValue] = useState(0);
    const [invariantXValue, setInvariantXValue] = useState(0);
    const [selected, setSelected] = useState(false);

    useEffect( async () => {
            const graphPath = props.graphPath.value.path;
            let envelope_request = new URL(`http://localhost:8080${graphPath}/polytope`);
            envelope_request.searchParams.append("max_graph_size", props.numberVertices);
            envelope_request.searchParams.append("invariants", props.invariantName);
            envelope_request.searchParams.append("invariants", props.invariantColor);
            console.debug("Fetching", envelope_request.toString());


            // First fetch the envelopes
            const envelope = await fetch(envelope_request.toString())
                .then(response => response.json())
                .then(json => {
                    console.debug("Fetched", envelope_request.toString());
                    return readEnvelope(json);
                });

            let points_request = new URL(`http://localhost:8080${graphPath}/points`);
            points_request.searchParams.append("max_graph_size", props.numberVertices);
            points_request.searchParams.append("invariants", props.invariantName);
            points_request.searchParams.append("invariants", props.invariantColor);
            console.debug("Fetching", points_request.toString());

            // then fetch the points
            const points = await fetch(points_request.toString())
                .then(response => response.json())
                .then(json => {
                    console.debug("Fetched", points_request.toString());
                    return readPoints(json);
                });

            points.push({type: 'line', label: "Envelope", borderColor: "0xFFFFFF", data: envelope});
            setData({datasets: points});

        },
        [props.invariantName, props.invariantColor, props.numberVertices]);

    const options = {
        /*events: [
            onclick = (evt) => {
                console.log("cool");
                console.log(evt);
            }
        ],*/
        // title: { display: true, text: "Polytope pour l'invariant " + props.invariant},
        /*plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                },
                zoom:{
                    wheel: {enabled: true, modifierKey: 'ctrl'},
                    drag: {enabled: true, modifierKey: 'shift'},
                    pinch: {enabled: true},
                    mode: 'xy'
                }
            }
        }*/
    };

    const handleClick = (elt, evt) => {
        if (elt.length > 0) {
            let datasetIndex = elt[0]["datasetIndex"];
            let index = elt[0]["index"];
            let point = data["datasets"][datasetIndex]["data"][index];
            setInvariantYValue(point["y"]);
            setInvariantXValue(point["x"]);
            setSelected(true);
        } else {
            setSelected(false);
        }
    }

    const RenderGraphs = () => {
        if (selected) {
            return <Graphs
                graphPath={props.graphPath}
                invariantXName={props.invariantName}
                invariantXValue={invariantXValue}
                numberVertices={props.numberVertices}
                invariantYName={props.invariantColor}
                invariantYValue={invariantYValue}
            />;
        } else {
            return null;
        }
    }

    return (
        <div>
            <h4> Polytope Chart </h4>
            <Bubble
                data={data}
                options={options}
                height={200}
                getElementAtEvent={(elt, evt) => handleClick(elt, evt)}
                type={"bubble"}/>
            <RenderGraphs />
        </div>
    )
}


