import React, {useCallback, useEffect, useState} from "react";
import GraphSlider from "./GraphSlider";
import {API_URL} from "../../.env";
import "./Graphs.css";
import {stringify} from "qs";
import {View} from "react-native-web";
import InnerText from "../styles_and_settings/InnerText";
import SubTitleText from "../styles_and_settings/SubTitleText";
import {LEFT, RIGHT, TOP} from "../../designVars";
import {readGraph} from "../../core/ParseFiles";
import {Slider} from "@mui/material";
import axios from "axios";

export default function GraphsFetch(props) {
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    const [data, setData] = useState(null); // La liste des graphes correspondant aux critères
    const [currentNbOfSlider, setCurrentNbOfSlider] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect( () => {
        let graphs_request = new URL(`${API_URL}/graphs`)

        graphs_request.searchParams.append("order", props.order);
        graphs_request.searchParams.append("invariants[0][name]", props.invariantX);
        graphs_request.searchParams.append("invariants[1][name]", props.invariantY);
        // Filter for specific invariant values
        graphs_request.searchParams.append("invariants[0][value]", props.invariantXValue);
        graphs_request.searchParams.append("invariants[1][value]", props.invariantYValue);

        // graphs_request.searchParams.append("constraints", stringify(props.constraints));
        graphs_request = graphs_request.toString() + "&"  + stringify({
            constraints: props.constraints
        });

        const advancedConstraits = {
            query: props.advancedConstraints,
        }


        fetchData(graphs_request, advancedConstraits).then(data => {
            setData(data);
            setLoading(false);
            setError(null);
        }).catch(error => {
            setError(error);
            setLoading(false);
        });
        forceUpdate();
    }, [props.order, props.invariantX, props.invariantXValue, props.invariantY, props.invariantYValue] );

    const fetchData = (request, body) => {
        return axios.post(request.toString(), {...body, headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}})
            .then((d) => {
                return readGraph(d.data, props.invariantX, props.invariantXValue, props.invariantY, props.invariantYValue);
            });
    }

    if (error) return (
        <View style={{alignItems: 'center', justifyContent: 'center', height: '200px'}}>
            <InnerText>An error occurred while loading your data for graphs</InnerText>
        </View>
    );

    if (loading || data === null) {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', height: '200px'}}>
                <InnerText>Please wait, your data is being loaded for graphs</InnerText>
            </View>
        );
    }

    const handleChangeNbOfSliders = (newValue) => {
        setCurrentNbOfSlider(newValue);
        forceUpdate();
    }

    return (
        <View style={{paddingLeft: LEFT, paddingRight: RIGHT, paddingTop: TOP}}>
            <SubTitleText>Graphs</SubTitleText>
            {data &&
                <View style={{
                    alignItems: 'center',
                }}>
                    <InnerText>There are {data.length} graph{data.length===1 ? "":"s"}. You can display up to {data.length*2} sliders in same the time: </InnerText>
                    <Slider aria-label="nb_of_sliders" value={currentNbOfSlider} valueLabelDisplay="auto" step={1} marks
                        min={1} max={data.length*2} sx={{color: 'success.main', '& .MuiSlider-thumb':
                            {borderRadius: '1px',},}}
                        style={{width: '75%',}}
                            onChange={(event, newValue) => handleChangeNbOfSliders( newValue)}
                    />
                    <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                        alignItems: 'center', marginTop: TOP}}>
                        {Array.from(Array(currentNbOfSlider).keys()).map((num) =>{
                                return <GraphSlider key={"slider_" + num} graphList={data} firstGraphToShow={num % data.length}/>
                        })}
                    </View>
                </View>
            }
        </View>
    );
}