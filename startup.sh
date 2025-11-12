
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
npx spacetime generate frontend/module_bindings
spacetime publish -c -y

# Launch frontend dev server in a new terminal
alacritty --title "Frontend Dev" -e bash -c "cd frontend && npm run dev" &
sleep 1
# Move frontend dev window to Hyprland workspace 2
winid=$(hyprctl clients -j | jq -r '.[] | select(.title=="Frontend Dev") | .address')
if [ -n "$winid" ]; then
	hyprctl dispatch movetoworkspacesilent 2,address:$winid
fi
