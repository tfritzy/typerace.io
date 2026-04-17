
#!/bin/bash

# Launch spacetime start in a new terminal (blocking)
alacritty --title "Spacetime" -e bash -c "spacetime start" &
sleep 1
# Move spacetime window to Hyprland workspace 2
winid=$(hyprctl clients -j | jq -r '.[] | select(.title=="Spacetime") | .address')
if [ -n "$winid" ]; then
	hyprctl dispatch movetoworkspacesilent 2,address:$winid
fi

# Generate module bindings and publish module before starting frontend dev server
spacetime generate --lang typescript --out-dir frontend/module_bindings --project-path spacetimedb
spacetime publish -c -y --project-path spacetimedb

# Launch frontend dev server in a new terminal
alacritty --title "Frontend Dev" -e bash -c "cd frontend && npm run dev" &
sleep 1
# Move frontend dev window to Hyprland workspace 2
winid=$(hyprctl clients -j | jq -r '.[] | select(.title=="Frontend Dev") | .address')
if [ -n "$winid" ]; then
	hyprctl dispatch movetoworkspacesilent 2,address:$winid
fi
