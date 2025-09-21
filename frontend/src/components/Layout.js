import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Receipt as OrdersIcon,
  Analytics as AnalyticsIcon,
  Store as StoreIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 280;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
    color: "#4f46e5",
    description: "Overview & Analytics",
  },
  {
    text: "Inventory",
    icon: <InventoryIcon />,
    path: "/inventory",
    color: "#059669",
    description: "Manage Products",
  },
  {
    text: "Orders",
    icon: <OrdersIcon />,
    path: "/orders",
    color: "#dc2626",
    description: "Sales & Transactions",
  },
  {
    text: "Analytics",
    icon: <AnalyticsIcon />,
    path: "/analytics",
    color: "#7c3aed",
    description: "Reports & Insights",
  },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <StoreIcon
            sx={{
              mr: 2,
              color: "primary.main",
              fontSize: 32,
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Mahajan's Store
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Inventory Management System
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 2,
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: location.pathname === item.path ? "4px" : "0px",
                  background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                  transition: "width 0.2s ease-in-out",
                },
                "&:hover": {
                  backgroundColor: "action.hover",
                  transform: "translateX(4px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? item.color
                      : "text.secondary",
                  minWidth: 48,
                  mr: 2,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight={600}>
                    {item.text}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                }
              />
              {location.pathname === item.path && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                    color: "white",
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          © 2024 Mahajan's Store
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "background.paper",
          backdropFilter: "blur(10px)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              color: "text.primary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {menuItems.find((item) => item.path === location.pathname)
                ?.text || "Mahajan's Store Management"}
              <Chip
                label="Live"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ color: "text.secondary" }}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "background.default",
          transition: "background-color 0.2s ease-in-out",
        }}
      >
        <Box sx={{ flexGrow: 1, mb: 4 }}>{children}</Box>
        <Box
          component="footer"
          sx={{
            mt: "auto",
            py: 3,
            px: 2,
            textAlign: "center",
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            mx: 2,
            mb: 2,
            transition: "background-color 0.2s ease-in-out",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <StoreIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Mahajan's Store Management System
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            Made with ❤️ by Mahajan Ashok | © 2024 All rights reserved
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
