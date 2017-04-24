uniform vec3 iResolution;
uniform samplerXX iChannel0;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec4 col = texture(iChannel0, uv);
    if (col.r > 0.5) {
        fragColor = col;
    }
    else {
        bool found = false;
        for (float x = -2.0; x < 2.0; ++x) {
            for (float y = -2.0; y < 2.0; ++y) {
                if (texture(iChannel0, vec2((fragCoord.x + x) / iResolution.x, (fragCoord.y + y) / iResolution.y)).r > 0.5) {
                    found = true;
                }
            }
        }
        if (found) {
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
        else {
            fragColor = col;
        }
    }
}

