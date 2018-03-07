// Takes in data and 'stages', where each stage is a description of a section of animation. 
// Outputs a list of all elements used, and corresponding initial values and transitions for each stage.each

function knit_animation(data, stages){
    var elements = {};
    var element_attrs = {};
    var animation = {stages:[]};
    var total_duration = 0;
    // Initial pass through stages to get all elements
    for(var s = 0; s < stages.length; s++){
        var stage = stages[s];
        for(var ne = 0; ne < Object.keys(stage.new_elements).length; ne++){
            elements[Object.keys(stage.new_elements)[ne]] = stage.new_elements[Object.keys(stage.new_elements)[ne]].el;
            elements[Object.keys(stage.new_elements)[ne]].init_vals = [[-1, {active:false}]];
            element_attrs[Object.keys(stage.new_elements)[ne]] = {active:false};
        }
        total_duration += stage.stage_duration;
    }
    animation.elements = elements;
    animation.total_duration = total_duration;

    var updated_last_stage = [];
    // Pass through stages again, extracting transitions and tracking ele attrs through stages.
    for(var st = 0; st < stages.length; st++){
        var cur_stage = stages[st];
        animation.stages.push({stage_name:cur_stage.stage_name, stage_duration:cur_stage.stage_duration});

        // Assigning initial values to new elements.
        for(var newe = 0; newe < Object.keys(cur_stage.new_elements).length; newe++){
            element_attrs[Object.keys(cur_stage.new_elements)[newe]] = Object.assign({}, cur_stage.new_elements[Object.keys(cur_stage.new_elements)[newe]].init);
            elements[Object.keys(cur_stage.new_elements)[newe]].init_vals.push([st, Object.assign({}, element_attrs[Object.keys(cur_stage.new_elements)[newe]])]);
        }

        // Assigning tracked attr values as initial values for stage.
        animation.stages[st].initial_attrs = {};
        for(var el = 0; el < updated_last_stage.length; el++){
            var element = element_attrs[updated_last_stage[el]];
            var element_init_vals = elements[updated_last_stage[el]].init_vals;
            if(JSON.stringify(element_init_vals[element_init_vals.length -1][1]) != JSON.stringify(element)) element_init_vals.push([st, Object.assign({}, element)]);
            //animation.stages[st].initial_attrs[Object.keys(element_attrs)[el]] = Object.assign({}, element);
        }
        
        updated_last_stage = [];
        // Extracting transitions and updating tracked attrs.
        animation.stages[st].element_transitions = {};
        for(var t = 0; t<Object.keys(cur_stage.element_transitions).length; t++){
            var transition_name = Object.keys(cur_stage.element_transitions)[t];
            var transition = cur_stage.element_transitions[transition_name];
            var interpolators = [];
            for(var attr_i = 0; attr_i < transition[1].length; attr_i++){
                interpolators.push(d3.interpolate(element_attrs[transition_name][transition[1][attr_i]], transition[2][attr_i]));
                element_attrs[transition_name][transition[1][attr_i]] = transition[2][attr_i];
            }
            transition.push(interpolators);
            animation.stages[st].element_transitions[transition_name] = transition;
            updated_last_stage.push(transition_name);
        }
    }

    animation.anim_progress_time = anim_progress_time.bind(animation);
    animation.anim_progress_percent = anim_progress_percent.bind(animation);
    return animation;
}

function anim_progress_time(time_since_start){
    time_since_start = Math.min(time_since_start, this.total_duration);
    var stage_index = 0;
    while(time_since_start > this.stages[stage_index].stage_duration){
        time_since_start -= this.stages[stage_index].stage_duration;
        stage_index++;
    }
    var prop_through = time_since_start/this.stages[stage_index].stage_duration;

    return[stage_index, prop_through];
}

function anim_progress_percent(percent){
    var time_since_start = percent * this.total_duration;
    return this.anim_progress_time(time_since_start);
}
// Stages should take in data and return:
// return_obj {
// stage_name :
// stage_duration : length stage will play in seconds
// new_elements : dict of elements created in this stage, key is name
// element_transitions : dict (element_name, [name, attribute, transition_to, start, fin]) where start and fin are start/ending percentages [0-1]
//}

//************** ADD NEW STAGES HERE ******************
test_data = [{start: [100,100], end: [200,100], color: "red"},{start: [300,300], end: [400,300], color: "blue"}];

function test_circle_fade(data){
    var stage = {stage_name: "circle_fade_in", stage_duration: 2};
    new_circles = {};
    for(var i =0; i < data.length; i++){
        new_circles["circle"+i] = {el:new AnimElement("circle"+i, "circle"), init:{x:data[i].start[0],y:data[i].start[1],color:data[i].color, opacity:0, r:10}};
    }
    stage.new_elements = new_circles;

    transitions = {};
    for(var n =0; n < data.length; n++){
        transitions["circle"+n] = ["circle"+n, "opacity", 1, 0, 1];
    }
    stage.element_transitions = transitions;
    return stage;
}

function test_circle_move(data){
    var stage = {stage_name: "circle_move", stage_duration: 2};
    new_circles = {};
    for(var i =0; i < data.length; i++){
        new_circles["circle_move"+i] = {el:new AnimElement("circle_move"+i, "circle"), init:{x:data[i].start[0],y:data[i].start[1],color:data[i].color, opacity:1, r:10}};
    }
    stage.new_elements = new_circles;

    transitions = {};
    for(var n =0; n < data.length; n++){
        transitions["circle"+n] = ["circle"+n, "x", data[n].end[0], 0, 1];
        transitions["circle_move"+n] = ["circle"+n, "r", 20, 0, 1];
    }
    stage.element_transitions = transitions;
    return stage;
}

function test_circle_fade_out(data){
    var stage = {stage_name: "circle_fade_in", stage_duration: 2};
    new_circles = {};
    stage.new_elements = new_circles;

    transitions = {};
    for(var n =0; n < data.length; n++){
        transitions["circle_move"+n] = ["circle_move"+n, "opacity", 0, 0, 1];
    }
    stage.element_transitions = transitions;
    return stage;
}

function one_circle_fade_in(data){
    var stage = {stage_name: "circle_fade_in", stage_duration: 2};
    new_circles = {};
    for(var i =data.length-1; i < data.length; i++){
        new_circles["line"+i] = {el:new AnimElement("line"+i, "line"), init:{x1:data[i].start[0],y1:data[i].start[1],
                                                                            x2:data[i].start[0],y2:parseInt(data[i].start[1]) + Math.random()*20,
                                                                            color:data[i].color, opacity:0, r:10}};
    }
    stage.new_elements = new_circles;

    transitions = {};
    for(var n =data.length-1; n < data.length; n++){
        transitions["line"+n] = ["line"+n, ["opacity"], [1], [0], [1]];
    }
    stage.element_transitions = transitions;
    return stage;
}

function one_hist(bounds, data){
    var stage = {stage_name: "one_hist", stage_duration: 0.5};
    stage.new_elements = draw_histogram_zero(bounds, data);
    var h = draw_histogram(bounds, data);
    transitions = hist_transition(stage.new_elements, h);
    stage.element_transitions = transitions;
    return [stage, h, stage.new_elements];
}

function next_hist(bounds, data, orig_h, orig_h_0){
    var stage = {stage_name: "one_hist", stage_duration: 0.5};
    
    var h = draw_histogram(bounds, data);
    var zero_h = draw_histogram_zero(bounds, data);
    // Elements in new hist but not original
    var new_keys = Object.keys(h).filter(x => Object.keys(orig_h).some(y => x==y) == false);
    stage.new_elements = new_keys.reduce(function(o,a){o[a] = zero_h[a]; return o;}, {});
    transitions = hist_transition(orig_h, h, orig_h_0, zero_h);
    stage.element_transitions = transitions;
    return [stage, h, zero_h];
}

function hist_stages(bounds, data){
    var stages = [];
    var data_cum = [];
    //var one_r = one_hist(bounds, data(1));
    var data_r = data([]);
    var data_hist = data_r[0];
    data_cum = data_r[1];
    var one_r = one_hist(bounds, data_hist);
    stages.push(one_r[0]);
    var last_hist = one_r[1];
    var last_hist_0 = one_r[2];
    for(var i = 0; i < 1000; i++){
        data_r = data(data_cum);
        data_hist = data_r[0];
        data_cum = data_r[1];
        //var two_r = next_hist(bounds, data(i+2), last_hist, last_hist_0);
        var two_r = next_hist(bounds, data_hist, last_hist, last_hist_0);
        stages.push(two_r[0]);
        last_hist = two_r[1];
        last_hist_0 = two_r[2];
    }

    return stages;
}
