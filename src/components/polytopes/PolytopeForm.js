import {Text, View} from "react-native-web";
import {BOTTOM, LEFT, RIGHT, TOP} from "../../designVars";
import {Autocomplete, IconButton, Slider, Switch, TextField} from "@mui/material";
import InnerText from "../styles_and_settings/InnerText";
import React, {useCallback, useState} from "react";
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import PolytopeFetch from "./PolytopeFetch";

export default function PolytopeForm(props) {
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [checked, setChecked] = useState(false);
    const [formData, setFormData] = useState({
        order: props.params.properties.order.default,
        invariantX: props.invariants[0],
        invariantY: props.invariants[1],
        invariantColor: "num_vertices", // Default coloration, all points are the same color because order is fixed
        constraints: [],
    });
    const [inputValues, setInputValues] = useState({
        invariantX: "",
        invariantY: "",
        invariantColor: "",
        constraints: [],
    })
    const [submitted, setSubmitted] = useState(false);
    const [numberConstraints, setNumberConstraints] = useState(0);

    const handleChange = (name, newValue) => {
        setFormData({...formData, [name]: newValue});
        forceUpdate();
    };

    const handleInputChange = (name, newValue) => {
        setInputValues({...inputValues, [name]: newValue});
    };

    const handleChangeChecked = (event) => {
        if (!event.target.checked) {
            setFormData({...formData, invariantColor: "num_vertices"});
        }
        setChecked(event.target.checked);
        setSubmitted(false);
        forceUpdate();
    };

    const handleAddConstraint = () => {
        formData.constraints.push({
            name: props.invariants[2],
            minimum_bound: 0,
            maximum_bound: 0,
        })
        inputValues.constraints.push({
            name: "",
            minimum_bound: "",
            maximum_bound: "",
        })
        setNumberConstraints(numberConstraints + 1);
        setSubmitted(false);
        forceUpdate();
    };

    const handleRemoveConstraint = (index) => {
        formData.constraints.splice(index, 1);
        inputValues.constraints.splice(index, 1);
        setNumberConstraints(numberConstraints - 1);
        setSubmitted(false);
        forceUpdate();
    };

    const handleChangeConstraint = (name, index, newValue) => {
        let newConstraints = formData.constraints;
        newConstraints[index][name] = newValue;
        setFormData({...formData, constraints: newConstraints});
        forceUpdate();
    };

    const handleInputChangeConstraint = (name, index, newValue) => {
        let newConstraints = inputValues.constraints;
        newConstraints[index][name] = newValue;
        setInputValues({...inputValues, constraints: newConstraints});
        forceUpdate();
    };

    const handleSubmit = () => {
        if (formData.invariantX === null || formData.invariantX === undefined
            || formData.invariantY === null || formData.invariantY === undefined
            || (checked && (formData.invariantColor === null || formData.invariantColor === undefined))) {
            alert("Please fill in all fields");
            return;
        }
        for (let i = 0; i < formData.constraints.length; i++) {
            if (formData.constraints[i].minimum_bound === null || formData.constraints[i].minimum_bound === undefined
                || formData.constraints[i].maximum_bound === null || formData.constraints[i].maximum_bound === undefined) {
                alert("Please fill in all fields");
                return;
            }
            if (formData.constraints[i].minimum_bound > formData.constraints[i].maximum_bound) {
                alert("Minimum bound must be less than maximum bound for constraint " + (i + 1));
                return;
            }
        }
        setSubmitted(true);
    };

    const RenderPolytopeFetch = () => {
        if (submitted) {
            return <PolytopeFetch
                endpoint={props.endpoint}
                order={formData.order}
                invariantX={formData.invariantX}
                invariantY={formData.invariantY}
                invariantColor={formData.invariantColor}
                constraints={formData.constraints}
            />;
        } else {
            return null;
        }
    };

    const constructConstraintsView = () => {
        let result = [];
        for (let index = 0; index < numberConstraints; index += 3) {
            let temp = [];
            for (let j = index; j < index + 3 && j < numberConstraints; j++) {
                temp.push(
                    <View
                        key={`inv${index}-${j}`}
                        style={{
                            marginRight: '5%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '5%',
                            paddingBottom: BOTTOM,
                            paddingTop: TOP,
                            background: '#eaeaea',
                            width: '30%'
                        }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '5%',
                        }}>
                            <Text style={{
                                fontSize: '25px'
                            }}>{"Constraint " + (j + 1)}</Text>
                            <IconButton onClick={() => handleRemoveConstraint(index)}>
                                <DeleteOutlineIcon/>
                            </IconButton>
                        </View>
                        <Autocomplete
                            value={formData.constraints[index].name}
                            onChange={(event, newValue) => handleChangeConstraint("name", index, newValue)}
                            inputValue={inputValues.constraints[index].name}
                            onInputChange={(event, newValue) => handleInputChangeConstraint("name", index, newValue)}
                            id={`auto-complete-constraint-${index}`}
                            options={props.invariants}
                            sx={{width: '90%'}}
                            clearIcon={null}
                            renderInput={(params) =>
                                <TextField {...params} label="Invariant name"/>}
                        />
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            justifyContent: 'center',
                        }}>
                            <TextField
                                value={formData.constraints[index].minimum_bound}
                                onChange={(event) => handleChangeConstraint('minimum_bound', index, event.target.value)}
                                id="minimum-bound"
                                label="Minimum"
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                margin='normal'
                                sx={{width: '45%'}}
                                variant="outlined"
                            />
                            <TextField
                                id="maximum-bound"
                                label="Maximum"
                                onChange={(event) => handleChangeConstraint('maximum_bound', index, event.target.value)}
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.constraints[j].maximum_bound}
                                margin='normal'
                                sx={{width: '45%'}}
                                variant="outlined"
                            />
                        </View>
                    </View>)
                if (j === index + 2) {
                    result.push(temp);
                    temp = [];
                }
            }
            if (temp.length > 0) {
                result.push(temp);
            }
        }
        return result;
    }

    const RenderColorView = () => {
        return (<View
            style={{
                marginRight: '5%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingBottom: BOTTOM,
                paddingTop: TOP,
                background: checked ? '#eaeaea' : '#f5f5f5',
                width: '30%'
            }}>
            <View
                style={{
                    flewDirection: 'row',
                    marginBottom: BOTTOM,
                }}>
                <Text style={{
                    fontSize: '25px',
                    color: checked ? '#000000' : '#bdbdbd',
                }}><Switch checked={checked} onChange={handleChangeChecked}/>Color points</Text>
            </View>
            <Autocomplete
                value={formData.invariantColor}
                onChange={(event, newValue) => handleChange("invariantColor", newValue)}
                inputValue={inputValues.invariantColor}
                onInputChange={(event, newValue) => handleInputChange("invariantColor", newValue)}
                id="auto-complete-color"
                options={props.invariants}
                sx={{width: '90%'}}
                clearIcon={null}
                disabled={!checked}
                renderInput={(params) =>
                    <TextField {...params} label="Invariant for color of points"/>}
            />
        </View>)
    }

    const RenderXView = () => {
        return (
            <View
                style={{
                    marginRight: '5%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: BOTTOM,
                    paddingTop: TOP,
                    background: '#eaeaea',
                    width: '30%'
                }}>
                <Text style={{
                    fontSize: '25px',
                }}>X axis</Text>
                <br/>
                <Autocomplete
                    disablePortal
                    value={formData.invariantX}
                    onChange={(event, newValue) => handleChange("invariantX", newValue)}
                    inputValue={inputValues.invariantX}
                    onInputChange={(event, newValue) => handleInputChange("invariantX", newValue)}
                    id="auto-complete-x"
                    options={props.invariants}
                    sx={{width: '90%'}}
                    clearIcon={null}
                    renderInput={(params) =>
                        <TextField {...params} label="Invariant for X axis"/>}
                />
            </View>
        )
    }

    const RenderYView = () => {
        return (
            <View
                style={{
                    marginRight: '5%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: BOTTOM,
                    paddingTop: TOP,
                    background: '#eaeaea',
                    width: '30%'
                }}>
                <Text style={{
                    fontSize: '25px'
                }}>Y axis</Text>
                <br/>
                <Autocomplete
                    id="auto-complete-y"
                    value={formData.invariantY}
                    onChange={(event, newValue) => handleChange("invariantY", newValue)}
                    inputValue={inputValues.invariantY}
                    onInputChange={(event, newValue) => handleInputChange("invariantY", newValue)}
                    options={props.invariants}
                    clearIcon={null}
                    sx={{width: '90%'}}
                    renderInput={(params) =>
                        <TextField {...params} label="Invariant for Y axis"/>}
                />
            </View>
        )
    }

    return (
        <View>
            <View
                style={{
                    paddingLeft: LEFT,
                    paddingRight: RIGHT,
                }}>
                <form>
                    <View
                        style={{
                            alignItems: 'center',
                            paddingBottom: BOTTOM
                        }}>
                        <Text style={{
                            fontSize: '25px'
                        }}>Please complete your request</Text>
                    </View>
                    <InnerText>Please select number of vertices by graph (order)</InnerText>
                    <View style={{
                        alignItems: 'center',
                        paddingBottom: BOTTOM,
                        paddingTop: TOP,
                    }}>
                        <Slider
                            aria-label="GraphOrder"
                            defaultValue={props.params.properties.order.default}
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={props.params.properties.order.minimum}
                            max={props.params.properties.order.maximum}
                            sx={{
                                color: 'success.main',
                                '& .MuiSlider-thumb': {
                                    borderRadius: '1px',
                                },
                            }}
                            style={{
                                width: '75%',
                            }}
                            onChange={(event, newValue) => {
                                handleChange("order", newValue);
                                setSubmitted(false);
                            }}
                        />
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            flex: 1,
                            width: '100%'
                        }}>
                        <RenderXView />
                        <RenderYView />
                        <RenderColorView/>
                    </View>
                    {constructConstraintsView().map((group, i) => {
                        return (
                            <View
                                key={`view${i}`}
                                style={{
                                    flexDirection: 'row',
                                    flex: 1,
                                    width: '100%'
                                }}>
                                {group}
                            </View>)
                    })}
                    <View
                        key="AddConstraint"
                        style={{
                            paddingTop: TOP,
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                        }}>
                        <Button variant="outlined" onClick={handleAddConstraint} color="success"
                                startIcon={<AddCircleOutlineIcon/>}>
                            Do you want add a constraint?
                        </Button>
                        <Button variant="contained" color="success" onClick={handleSubmit} endIcon={<SendIcon/>}>
                            Submit
                        </Button>
                    </View>
                </form>
            </View>
            <RenderPolytopeFetch/>
        </View>
    )
}