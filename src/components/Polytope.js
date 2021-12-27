import Select from 'react-select';
import React, {useState, useEffect} from "react";
import Form from '@rjsf/material-ui';
import PolytopeChart from "./PolytopeChart.js";

const API_URL = "http://localhost:8080/endpoints"


async function get_endpoints() {
    return await fetch(API_URL, {method: "GET"})
        .then(response => response.json())
        .then(data => {
            const endpoints = []
            for (const endpt in data.endpoints) {
                if (data.endpoints.hasOwnProperty(endpt)) {
                    endpoints.push(data.endpoints[endpt])
                }
            }
            return endpoints.map(endpt => ({value: endpt, label: endpt.name}));
        })
}

// Component's core
export default function Polytope(props) {
    let first_run = true
    let form_values = {}

    const [endpoints, setEndpoints] = useState([]); // No endpoints by default, then query from API
    const [endpoint, setEndpoint] = useState(null);

    const [submit, setSubmit] = useState(false);

    useEffect(() => {
        if (!first_run) return;
        first_run = false;
        get_endpoints()
            .then((endpoints) => {
                setEndpoints(endpoints);
            })
    }, [])

    const handleChangePolytopeType = (newPolytopeType) => {
        setEndpoint(newPolytopeType);
        setSubmit(false);
        return true;
    }

    const handleFormChangeGenerator = (question) => {
        return (newValue, actionMeta) => handleFormChange(question, newValue, actionMeta);
    }

    const handleFormChange = (question, newValue, actionMeta) => {
        console.debug(question);
        console.debug(newValue);
        const [, setter] = form_values[question];
        setter(newValue.value);
        setSubmit(false);
        console.debug(form_values[question]);
    }

    const handleInputChangeGenerator = (question, type) => {
        return (event) => handleInputChange(question, type, event);
    }

    const handleInputChange = (question, type, event) =>  {
        console.log(question, event.target.value);
        const [, setter] = form_values[question];
        if (type === 'number') {
            const number = Number.parseInt(event.target.value); // TODO better handle invalid numbers
            if (!isNaN(number)) {
                setter(number);
            }
        } else {
            setter(event.target.value);
        }
        setSubmit(false);
        console.debug(form_values[question]);
    }

    const clickSubmit = () => {
        setSubmit(true);
    }

    const RenderPolytopeChart = () => {
        console.log("Rendering Polytope with parameters: " + form_values);
        if (submit) {
            return <PolytopeChart invariantName={"avcol"} numberVertices={5}
                                  invariantColor={"mult"}/>;
        } else {
            return null;
        }
    }

    function onFormChange(event) {
        console.log("---Form changed---");
        console.log(event.formData);
    }

    function onFormSubmit(event) {
        console.log("---Form submitted---");
        console.log(event.formData);
    }


    const uiSchema = {
        "max_graph_size": {
            "ui:widget": "range"
        },
    }

    return (
        <div>
            <h3> Polytope {props.num}</h3>
            <form>
                <label>
                    Quel type de polytopes souhaitez-vous étudier ?
                    <Select
                        //defaultValue={endpoints}
                        onChange={handleChangePolytopeType}
                        options={endpoints}
                    />
                </label>
            </form>
            {!!endpoint &&
                <Form
                    schema={endpoint.value.params}
                    uiSchema={uiSchema}
                    onChange={onFormChange}
                    onSubmit={onFormSubmit}
                    onError={console.log("errors")}/>
            }
            {
                //<form>
                //    <RenderMultipleQuestions/>
                //</form>
            }
            <button onClick={clickSubmit}> Soumettre</button>
            <RenderPolytopeChart/>
        </div>
    )
}