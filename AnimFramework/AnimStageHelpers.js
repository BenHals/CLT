function test_circles(bounds){
    var t_data = [];
    var stages = [];
    for(var i =0; i< 500; i++){
        t_data.push({start:[bounds.left*0 + 10 + Math.random()*(bounds.width -bounds.left*0 - 20), bounds.top*0 + 10 + Math.random()*(bounds.height - bounds.top*0-20)], color:d3.rgb( Math.random()*255, Math.random()*255, Math.random()*255 )});
        stages.push(one_circle_fade_in(t_data));
    }
    return stages;
}

function histogram_data(x){
    var data = [];
    var num_rolls = 5;
    var samples = x;
    for(var s = 0; s < samples; s++){
        var sum = 0;
        for(var i =0; i < num_rolls; i++){
            sum += Math.ceil(d3.randomUniform(6)());
        }
        data.push(sum);
    }
    console.log(data);
    console.log(d3.histogram()(data));
    return (d3.histogram()(data));
}       

function draw_histogram(bounds, data){
    var width_third = bounds.width/3;
    var hist_start_x = width_third;
    var hist_end_x = width_third*2;
    var height_third = bounds.height/3;
    var hist_start_y = height_third;
    var hist_end_y = height_third*2;

    var first_bin = data[0];
    var last_bin = data[data.length-1];
    var bar_heights = data.map(bin => bin.length);
    var data_x_range = [first_bin.x0, last_bin.x1];
    console.log(data_x_range);
    var x_to_screen = d3.scaleLinear()
                    .domain(data_x_range)
                    .range([hist_start_x, hist_end_x]);
    var y_to_screen = d3.scaleLinear()
                    .domain([0, d3.max(bar_heights)])
                    .range([hist_end_y, hist_start_y]);

    var elements = {};
    elements["x_axis"] = {el:new AnimElement("x_axis", "line"), init:{x1:hist_start_x,y1:hist_end_y,
                                                                    x2:hist_end_x,y2:hist_end_y,
                                                                    color:"black", opacity:1}};
    elements["y_axis"] = {el:new AnimElement("y_axis", "line"), init:{x1:hist_start_x,y1:hist_start_y,
                                                                    x2:hist_start_x,y2:hist_end_y,
                                                                    color:"black", opacity:1}};
    for(var bar_index = 0; bar_index < data.length; bar_index++){
        elements["bar_top_" + bar_index] = {el:new AnimElement("bar_top_" + bar_index, "line"), 
                                        init:{x1:x_to_screen(data[bar_index].x0),y1:y_to_screen(bar_heights[bar_index]),
                                            x2:x_to_screen(data[bar_index].x1),y2:y_to_screen(bar_heights[bar_index]),
                                            color:"black", opacity:1}};
        elements["bar_right_" + bar_index] = {el:new AnimElement("bar_right_" + bar_index, "line"), 
                                        init:{x1:x_to_screen(data[bar_index].x1),y1:y_to_screen(bar_heights[bar_index]),
                                            x2:x_to_screen(data[bar_index].x1),y2:y_to_screen(0),
                                            color:"black", opacity:1}};
        elements["bar_left_" + bar_index] = {el:new AnimElement("bar_left_" + bar_index, "line"), 
                                        init:{x1:x_to_screen(data[bar_index].x0),y1:y_to_screen(bar_heights[bar_index]),
                                            x2:x_to_screen(data[bar_index].x0),y2:y_to_screen(0),
                                            color:"black", opacity:1}};
    }

    return elements;

}
function draw_histogram_zero(bounds, data){
    var width_third = bounds.width/3;
    var hist_start_x = width_third;
    var hist_end_x = width_third*2;
    var height_third = bounds.height/3;
    var hist_start_y = height_third;
    var hist_end_y = height_third*2;

    var first_bin = data[0];
    var last_bin = data[data.length-1];
    var bar_heights = data.map(bin => bin.length);
    var data_x_range = [first_bin.x0, last_bin.x1];
    console.log(data_x_range);
    var x_to_screen = d3.scaleLinear()
                    .domain(data_x_range)
                    .range([hist_start_x, hist_end_x]);
    var y_to_screen = d3.scaleLinear()
                    .domain([0, d3.max(bar_heights)])
                    .range([hist_end_y, hist_start_y]);

    var elements = {};
    elements["x_axis"] = {el:new AnimElement("x_axis", "line"), init:{x1:hist_start_x,y1:hist_end_y,
                                                                    x2:hist_end_x,y2:hist_end_y,
                                                                    color:"black", opacity:1}};
    elements["y_axis"] = {el:new AnimElement("y_axis", "line"), init:{x1:hist_start_x,y1:hist_start_y,
                                                                    x2:hist_start_x,y2:hist_end_y,
                                                                    color:"black", opacity:1}};
    for(var bar_index = 0; bar_index < data.length; bar_index++){
        elements["bar_top_" + bar_index] = {el:new AnimElement("bar_top_" + bar_index, "line"), 
                                        init:{x1:x_to_screen(data[bar_index].x0),y1:y_to_screen(0),
                                            x2:x_to_screen(data[bar_index].x1),y2:y_to_screen(0),
                                            color:"black", opacity:1}};
        elements["bar_right_" + bar_index] = {el:new AnimElement("bar_right_" + bar_index, "line"), 
                                        init:{x1:x_to_screen(data[bar_index].x1),y1:y_to_screen(0),
                                            x2:x_to_screen(data[bar_index].x1),y2:y_to_screen(0),
                                            color:"black", opacity:1}};
        elements["bar_left_" + bar_index] = {el:new AnimElement("bar_left_" + bar_index, "line"), 
                                        init:{x1:x_to_screen(data[bar_index].x0),y1:y_to_screen(0),
                                            x2:x_to_screen(data[bar_index].x0),y2:y_to_screen(0),
                                            color:"black", opacity:1}};
    }

    return elements;

}

function hist_transition(el1, el2, el1_0, el2_0){
    var transitions = {};
    var elements = Object.keys(el1);
    for(var el_i = 0; el_i < elements.length; el_i++){
        var original_el = el1[elements[el_i]];
        var new_el = elements[el_i] in el2 ? el2[elements[el_i]] : el1_0[elements[el_i]];
        if(new_el == undefined){
            console.log("wat");
        }
        var attrs = Object.keys(el1[elements[el_i]].init);
        var new_values = [];
        var start = [];
        var end = [];
        for(var attr_i = 0; attr_i<attrs.length; attr_i++){
            var attr_name = attrs[attr_i];
            new_values.push(new_el.init[attr_name]);
            start.push(0);
            end.push(1);
        }
        transitions[elements[el_i]] = [elements[el_i], attrs, new_values, start, end];
    }
    console.log(transitions);
    return(transitions);
}

function histogram_data_cumulative(data){
    var num_rolls = 5;
    var sum = 0;
    for(var i =0; i < num_rolls; i++){
        sum += Math.ceil(d3.randomUniform(6)());
    }
    data.push(sum);
    console.log(data);
    console.log(d3.histogram()(data));
    return [d3.histogram()(data), data];
} 