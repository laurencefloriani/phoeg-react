import React, {useEffect, useState} from "react";
import {readEnvelope, readPoints} from "../core/ParseFiles";
import {Group} from "@visx/group";
import {Axis, AxisLeft} from "@visx/axis";
import {scaleLinear} from "@visx/scale";
import {Circle, LinePath} from "@visx/shape";

const accessors = (data, param) => {
    if (data !== undefined) { // Obligatoire sinon problème car est parfois appelé avec un undefined
        switch (param) {
            case 'x':
                return data.x;
            case 'y':
                return data.y;
            case 'r':
                return data.r;
            default:
                return data.c;
        }
    }
}

export default function PolytopeChart(props) {
    const background = '#f3f3f3';
    const width = 750;
    const height = 500;
    const margin = { top: 35, right: 35, bottom: 35, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const [allClusters, setAllClusters] = useState({});
    const [lines, setLines] = useState([{}]);
    const [clusterList, setClusterList] = useState([]);
    const [indexCluster, setIndexCluster] = useState(0);
    const [minX, setMinX] = useState(0);
    const [maxX, setMaxX] = useState(0);
    const [minY, setMinY] = useState(0);
    const [maxY, setMaxY] = useState(0);
    const [previousState, setPreviousState] = useState(0);

    const [domain, setDomain] = useState([]);
    const [range, setRange] = useState([]);
    const colorScale = scaleLinear({
        domain: domain,
        range: range
    });

    useEffect( async () => {
        let pathEnv = "assets/data_" + props.invariantX + "/enveloppes/enveloppe-" + props.invariantY + ".json";
        let pathPoints = "assets/data_" + props.invariantX + "/points/points-" + props.invariantY + ".json";

        const tempLines = await fetch(pathEnv, {headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}})
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                return readEnvelope(myJson);
            });
        const tempPoints = await fetch(pathPoints, {headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}})
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                return readPoints(myJson, props.invariantX, "m", props.invariantColor); // ToDo A modifier pour ne pas être hard coder
            })
        setMinX(Math.min(
            Math.min(...tempPoints.map((d) => accessors(d, "x"))),
            Math.min(...tempLines.map((d) => accessors(d, "x")))
        ));
        setMaxX(Math.max(
            Math.max(...tempPoints.map((d) => accessors(d, "x"))),
            Math.max(...tempLines.map((d) => accessors(d, "x")))
        ));
        setMinY(Math.min(
            Math.min(...tempPoints.map((d) => accessors(d, "y"))),
            Math.min(...tempLines.map((d) => accessors(d, "y")))
        ));
        setMaxY(Math.max(
            Math.max(...tempPoints.map((d) => accessors(d, "y"))),
            Math.max(...tempLines.map((d) => accessors(d, "y")))
        ));
        setLines(tempLines);
        let groupedByColor = regroupPointsByColor(tempPoints); // COLORS et GROUPEDBYCOLOR
        let clusters = computeAllCluster(groupedByColor.pointsGr, groupedByColor.cols, tempPoints);
        setAllClusters(clusters.allClusters);
        setClusterList(clusters.clusterPossible);
    },
        [props.invariantX, props.invariantY, props.invariantColor]);

    const xScale = scaleLinear({
        range: [margin.left, innerWidth],
        domain: [minX, maxX],
        round: true,
    });

    const yScale = scaleLinear({
        range: [innerHeight, margin.top],
        domain: [minY, maxY],
        round: true,
    });

    const regroupPointsByColor = (points) => {
        let pointsGr = {};
        for (let point of points) {
            if (pointsGr[point.col] == null) {
                pointsGr[point.col] = [];
            }
            pointsGr[point.col].push(point);
        }
        return {
            cols: Object.keys(pointsGr).map(x => parseInt(x)).sort((a, b) => a - b),
            pointsGr: pointsGr
        };
    }

    const computeAllCluster = (groupedByColor, colors, points) => {
        let currentNbCluster = 2;
        let currentSizeCluster = Math.floor(colors.length / currentNbCluster);
        let viewedNb = [1];
        let result = {
            1: [points]
        };
        while (currentNbCluster <= colors.length) {
            let currentClusters = regroupPointsInCluster(currentSizeCluster, colors, groupedByColor);
            if (!viewedNb.includes(currentClusters.length)) {
                viewedNb.push(currentClusters.length);
                result[currentClusters.length] = currentClusters;
            }
            currentNbCluster += 1;
            currentSizeCluster = Math.ceil(colors.length / currentNbCluster);
        }
        return {
            clusterPossible: viewedNb.sort((a, b) => a - b),
            allClusters: result
        };
    }

    const regroupPointsInCluster = (sizeCluster, colors, groupedPointsByColor) => {
        let result = [];
        let start = 0;
        let end = sizeCluster;
        while (end <= colors.length - sizeCluster) {
            let temp = [];
            while (start < end) {
                temp.push(...groupedPointsByColor[colors[start]]);
                start += 1;
            }
            result.push(temp);
            end += sizeCluster;
        }
        let temp = [];
        while (start < colors.length) {
            temp.push(...groupedPointsByColor[colors[start]]);
            start += 1;
        }
        result.push(temp);
        return result;
    }

    const computeNamesDomain = (currentGroupedPoints) => {
        let result = [];
        for (let group of currentGroupedPoints) {
            let min = Math.min(...group.map((d) => d.col));
            let max = Math.max(...group.map((d) => d.col));
            if (min !== max) {
                result.push(`${min} - ${max}`);
            } else {
                result.push(`${min}`);
            }

        }
        return result;
    }

    const computeColorsRange = (newDomain) => {
        let result = [];
        if (range.length > newDomain.length) {
            result = range.slice(0, newDomain.length); // Copie du nombre de couleurs nécessaires
        } else if (range.length < newDomain.length) {
            result = range.slice(); // Copier l'entièreté des précédentes couleurs
            let i = range.length;
            while (i < newDomain.length) { // Compléter avec suffisamment de couleurs
                let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
                while (color in result) {
                    color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
                }
                result.push(color);
                i++;
            }
        }
        return result;
    }

    const RenderInputColors = () => {
        let result = [<p> { props.invariantColor } : </p>];
        for (let i in range) {
            result.push(
                <p> {domain[i]} <input type="color" value={range[i]} onChange={e => {
                    let tempRange = range.slice();
                    tempRange[i] = e.target.value;
                    setRange(tempRange);
                }} />
                </p>

            )
        }
        return result;
    }

    const RenderCircleSeries = () => {
        let result = [];
        if (clusterList.length > 0) { // Important car parfois appelé avant que les données ne soient correctement initialisées
            let currentClustersNumber = clusterList[indexCluster];
            let currentGroupedPoints = allClusters[currentClustersNumber];
            if (previousState !== currentClustersNumber) { // Il faut modifier le range et le domain du color scale
                setPreviousState(currentClustersNumber);
                let currentDomain = computeNamesDomain(currentGroupedPoints);
                setDomain(currentDomain);
                setRange(computeColorsRange(currentDomain));
            }
            currentGroupedPoints.map((group, i) => {
                group.map((currentData, j) => result.push(
                    <React.Fragment key={`group-${i}-${j}`}>
                        <Circle
                            cx={xScale(accessors(currentData, "x"))}
                            cy={yScale(accessors(currentData, "y"))}
                            r={3}
                            fill={range[i]}
                            fillOpacity={0.75}
                        />
                    </React.Fragment>
                ));
            });
            return result;
        } else {
            return null;
        }
    }

    return (
        <div>
            <svg width={width} height={height}>
                <rect width={width} height={height} fill={background}/>
                <Group left={margin.left} top={margin.top}>
                    <AxisLeft scale={yScale} left={margin.left} />
                    <Axis orientation="bottom" scale={xScale} top={innerHeight} />
                    <Group pointerEvents="none">
                        <LinePath
                            stroke="black"
                            strokeWidth={ 1 }
                            data={ lines }
                            x={ (d) => xScale(accessors(d, "x")) }
                            y={ (d) => yScale(accessors(d, "y")) }
                        />
                        <RenderCircleSeries />
                    </Group>
                </Group>
            </svg>
            <RenderInputColors />
            <p>
                Combien souhaitez-vous de clusters pour colorier les graphes ? {clusterList.map(d => d + " ")}
            </p>
            <button onClick={() => setIndexCluster(indexCluster > 0 ? indexCluster - 1 : clusterList.length - 1)}> Précédent </button>
            {" " + clusterList[indexCluster] + " "}
            <button onClick={() => setIndexCluster((indexCluster+1) % clusterList.length)}> Suivant </button>
        </div>
            )
}
