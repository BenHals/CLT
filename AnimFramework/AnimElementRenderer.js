class AnimElementRenderer{
    constructor() {
        this.render_type_map = {"circle":this.render_circle, "line":this.render_line};
    }

    render(ctx, elements){
        var element_names = Object.keys(elements);
        for(var e = 0; e<element_names.length; e++){
            var element = elements[element_names[e]];
            if(element.attrs.active == false) break;
            if(element.custom_render != undefined){
                element.custom_render(ctx);
            }else{

                this.render_type_map[element.type](ctx, element);
            }
        }
    }

    render_circle(ctx, element){
        var color = d3.color(element.attrs.color);
        color.opacity = element.attrs.opacity;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(parseInt(element.attrs.x),parseInt(element.attrs.y),parseInt(element.attrs.r),0,2*Math.PI);
        ctx.stroke();
    }

    render_line(ctx, element){
        var color = d3.color(element.attrs.color);
        color.opacity = element.attrs.opacity;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(parseInt(element.attrs.x1), parseInt(element.attrs.y1));
        ctx.lineTo(parseInt(element.attrs.x2),parseInt(element.attrs.y2));
        ctx.stroke();
    }
}