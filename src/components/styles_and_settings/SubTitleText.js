import {View} from "react-native";
import {Text} from "react-native-web";
import {
    COLOR_TITLES,
    DIVIDING_LINE_STYLE,
    BOTTOM,
    INNER,
    SUBTITLE_SIZE
} from "../../designVars";

export default function SubTitleText(props) {
    return (
        <View style={{flexDirection: 'row', alignItems: 'left'}}>
            <View>
                <Text
                    style={{
                        fontSize: SUBTITLE_SIZE,
                        fontStyle: "italic",
                        fontWeight: 'bold',
                        paddingRight: INNER,
                        paddingBottom: BOTTOM,
                        color: COLOR_TITLES,
                        minWidth: '150px'
                }}>
                    {props.children}
                </Text>
            </View>
            <View style={DIVIDING_LINE_STYLE} />
        </View>
    );
}