class AnimController{
    constructor(container){
        this.container = container;
        this.paused = true;
        this.progress_time = 0;
        this.animation_loaded = false;
        this.current_stage = null;
        this.renderer = new AnimElementRenderer();
    }

    init_area(){
        this.container_bounding = this.container.getBoundingClientRect();

        this.base_layer_canvas = document.createElement("canvas");
        this.base_layer_canvas.setAttribute("id","anim_base_layer_canvas");
        this.base_layer_canvas.setAttribute("width", this.container_bounding.width);
        this.base_layer_canvas.setAttribute("height", this.container_bounding.height);
        this.base_layer_canvas.style.position = "absolute";
        this.base_layer_ctx = this.base_layer_canvas.getContext("2d");

        this.dynamic_layer_canvas = document.createElement("canvas");
        this.dynamic_layer_canvas.setAttribute("id","anim_dynamic_layer_canvas");
        this.dynamic_layer_canvas.setAttribute("width", this.container_bounding.width);
        this.dynamic_layer_canvas.setAttribute("height", this.container_bounding.height);
        this.dynamic_layer_canvas.style.position = "absolute";
        this.dynamic_layer_ctx = this.dynamic_layer_canvas.getContext("2d");

        this.container.appendChild(this.base_layer_canvas);
        this.container.appendChild(this.dynamic_layer_canvas);
    }

    load_animation(animation){
        this.animation = animation;
        this.paused = true;
        this.progress_time = 0;
        this.animation_loaded = true;
        this.current_stage = null;
    }

    update_animation(time_since_start){
        this.progress_time = time_since_start;
        var progress = this.animation.anim_progress_time(this.progress_time);

        // Do we need to load a new stage?
        if(this.current_stage != progress[0]){
            this.load_stage(progress[0]);
        }
        this.run_interpolators(progress);
    }

    update_animation_percent(p){
        this.update_animation((p/100) * this.animation.total_duration);
    }

    load_stage(stage_num){
        this.current_stage = stage_num;
        var element_names = Object.keys(this.animation.elements);
        //var initial_values = this.animation.stages[this.current_stage].initial_attrs;
        for(var e = 0; e<element_names.length; e++){
            var element_name = element_names[e];
            //var element_initial_values = Object.keys(initial_values[element_name]);
            var initial_values = this.animation.elements[element_name].init_vals;
            var i_stage_index = 1;
            while(i_stage_index < initial_values.length  && stage_num >= initial_values[i_stage_index][0] ){
                i_stage_index++;
            }
            i_stage_index -= 1;
            var element_initial_values = initial_values[i_stage_index][1];
            this.animation.elements[element_name].attrs = Object.assign({}, element_initial_values);
            // for(var i=0; i<element_initial_values.length; i++){
            //     this.animation.elements[element_name].attrs[element_initial_values[i]] = initial_values[element_name][element_initial_values[i]];
            // }
        }
    }

    run_interpolators(progress){
        var transitions = this.animation.stages[this.current_stage].element_transitions;
        var element_names = Object.keys(transitions);
        for(var e =0; e < element_names.length; e++){
            var element_name = element_names[e];
            var attrs_to_change = transitions[element_name][1];
            var interpolaters = transitions[element_name][5];
            for(var attr_i = 0; attr_i<attrs_to_change.length; attr_i++){
                var intertpolated_attr = interpolaters[attr_i](progress[1]);
                this.animation.elements[element_name].attrs[attrs_to_change[attr_i]] = intertpolated_attr;
            }
        }
    }

    draw(){
        this.dynamic_layer_ctx.clearRect(0,0, this.container_bounding.width, this.container_bounding.height);
        this.renderer.render(this.dynamic_layer_ctx, this.animation.elements);
    }
}

var a;
window.onload = function(){
    //var ani = knit_animation(test_data, [test_circle_fade(test_data), test_circle_move(test_data),test_circle_fade_out(test_data)]);
    
    $(document).on('input', '#visAnimProgress', function(e){
        pause = true;
        animProg($('#visAnimProgress').val());
    });
    $(document).on('change', '#visAnimProgress', function(e){
        animProg($('#visAnimProgress').val());
        pause = false;
    });
    a = new AnimController(document.getElementById("main_display"));
    a.init_area();
    //var ani = knit_animation(test_data, test_circles(a.container_bounding));
    var ani = knit_animation(test_data, hist_stages(a.container_bounding, histogram_data_cumulative));
    a.load_animation(ani);
    console.log(a);

    animProg(t);
    requestAnimationFrame(test_update);
};
var t = 0;
var start_time = null;
var last_timestamp = null;
var pause = false;

function pauseToggle(){
    pause = !pause;
}
function test_update(timestamp){
    start_time = start_time == null ? timestamp : start_time;
    last_timestamp = last_timestamp == null ? timestamp : last_timestamp;
    var time_since_last = timestamp - last_timestamp;
    a.draw();
    if(!pause){
        t += time_since_last/(a.animation.total_duration*10);
        t = Math.abs(t%100);
        animProg(t);
    }
    $('#visAnimProgress').val(t);
    last_timestamp = timestamp;
    requestAnimationFrame(test_update);
}

function animProg(val){
    t = parseFloat(val);
    a.update_animation_percent(t);
}