from setuptools import find_packages, setup

setup(
    name="motion-studio-os",
    version="0.1.0",
    description="MotionStudio OS Sprint 1 — MCP bridge to After Effects",
    python_requires=">=3.11",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    package_data={"core.skills.motion_skills": ["bridge_host.jsx", "tokens.json"]},
    include_package_data=True,
    install_requires=[
        "mcp>=1.2.0",
        "python-dotenv>=1.0.0",
        "pillow>=10.0.0",
    ],
)
