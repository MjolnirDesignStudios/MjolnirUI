import asyncio
import os
from agent_framework import (
    ChatAgent,
    ChatMessage,
    Executor,
    WorkflowBuilder,
    WorkflowContext,
    WorkflowOutputEvent,
    handler,
)
from agent_framework.azure import AzureAIClient
from agent_framework.observability import configure_otel_providers
from azure.identity.aio import DefaultAzureCredential
from typing_extensions import Never

# Set up tracing for AI Toolkit
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://localhost:4317"
configure_otel_providers(
    enable_sensitive_data=True  # Enable capturing prompts and completions
)

# Configuration - replace with your Foundry project details
ENDPOINT = "https://your-foundry-project.openai.azure.com/"  # Replace with actual endpoint
MODEL_DEPLOYMENT_NAME = "gpt-5.1-codex"  # Or your preferred model

class UIGeneratorAgent(Executor):
    """Agent that generates React component code from prompts."""

    agent: ChatAgent

    def __init__(self, agent: ChatAgent, id="ui_generator"):
        self.agent = agent
        super().__init__(id=id)

    @handler
    async def generate_ui(self, prompt: str, ctx: WorkflowContext[str]) -> None:
        """Generate UI component code from the prompt."""
        messages = [ChatMessage(role="user", text=f"""
Generate a React component with animations for: {prompt}

Requirements:
- Use React functional components
- Include Framer Motion for animations
- Use TypeScript
- Make it responsive
- Include proper styling with Tailwind CSS
- Add interactive elements

Return only the component code, no explanations.
""")]
        response = await self.agent.run(messages)
        code = response.text
        await ctx.send_message(code)

class AnimationEnhancerAgent(Executor):
    """Agent that enhances the UI with advanced animations."""

    agent: ChatAgent

    def __init__(self, agent: ChatAgent, id="animation_enhancer"):
        self.agent = agent
        super().__init__(id=id)

    @handler
    async def enhance_animations(self, code: str, ctx: WorkflowContext[str]) -> None:
        """Add advanced animations to the component."""
        messages = [ChatMessage(role="user", text=f"""
Enhance this React component with advanced animations using Framer Motion:

{code}

Add:
- Stagger animations for lists
- Hover effects
- Page transitions
- Micro-interactions
- Scroll-triggered animations

Return the enhanced component code.
""")]
        response = await self.agent.run(messages)
        enhanced_code = response.text
        await ctx.send_message(enhanced_code)

class ShaderGeneratorAgent(Executor):
    """Agent that generates GLSL shader code for WebGL effects."""

    agent: ChatAgent

    def __init__(self, agent: ChatAgent, id="shader_generator"):
        self.agent = agent
        super().__init__(id=id)

    @handler
    async def generate_shader(self, prompt: str, ctx: WorkflowContext[str]) -> None:
        """Generate GLSL shader code from the prompt."""
        messages = [ChatMessage(role="user", text=f"""
Generate GLSL shader code for: {prompt}

Requirements:
- Valid GLSL syntax for WebGL
- Include both vertex and fragment shaders
- Use modern GLSL features
- Include uniforms for time, mouse, resolution
- Add comments explaining the shader logic
- Make it compatible with Three.js ShaderMaterial

Return only the shader code with proper structure.
""")]
        response = await self.agent.run(messages)
        shader_code = response.text
        await ctx.send_message(shader_code)

class WebGLValidatorAgent(Executor):
    """Agent that validates WebGL shader code and Three.js integration."""

    agent: ChatAgent

    def __init__(self, agent: ChatAgent, id="webgl_validator"):
        self.agent = agent
        super().__init__(id=id)

    @handler
    async def validate_webgl(self, shader_code: str, ctx: WorkflowContext[str]) -> None:
        """Validate and fix WebGL shader code."""
        messages = [ChatMessage(role="user", text=f"""
Validate this GLSL shader code for WebGL compatibility:

{shader_code}

Check for:
- GLSL syntax errors
- WebGL supported features
- Three.js ShaderMaterial compatibility
- Proper uniform declarations
- Correct varying variables
- Valid main function

Fix any issues and ensure it works with @react-three/fiber.
Return the corrected shader code.
""")]
        response = await self.agent.run(messages)
        validated_code = response.text
        await ctx.send_message(validated_code)

async def generate_ui_component(prompt: str) -> str:
    """Main function to generate UI component using the agent workflow."""
    async with (
        DefaultAzureCredential() as credential,
        AzureAIClient(
            project_endpoint=ENDPOINT,
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            credential=credential,
        ).create_agent(
            name="UIGenerator",
            instructions="You are an expert React developer specializing in animated UI components.",
        ) as ui_agent,
        AzureAIClient(
            project_endpoint=ENDPOINT,
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            credential=credential,
        ).create_agent(
            name="AnimationEnhancer",
            instructions="You are an expert in Framer Motion animations for React components.",
        ) as anim_agent,
        AzureAIClient(
            project_endpoint=ENDPOINT,
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            credential=credential,
        ).create_agent(
            name="CodeValidator",
            instructions="You are an expert code reviewer for React and TypeScript.",
        ) as validator_agent,
        AzureAIClient(
            project_endpoint=ENDPOINT,
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            credential=credential,
        ).create_agent(
            name="ShaderGenerator",
            instructions="You are an expert GLSL shader programmer for WebGL effects.",
        ) as shader_agent,
        AzureAIClient(
            project_endpoint=ENDPOINT,
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            credential=credential,
        ).create_agent(
            name="WebGLValidator",
            instructions="You are an expert in WebGL shader validation and Three.js integration.",
        ) as webgl_validator_agent,
    ):
        # Create executors
        ui_gen = UIGeneratorAgent(ui_agent)
        anim_enhancer = AnimationEnhancerAgent(anim_agent)
        validator = CodeValidatorAgent(validator_agent)
        shader_gen = ShaderGeneratorAgent(shader_agent)
        webgl_validator = WebGLValidatorAgent(webgl_validator_agent)

        # Build workflow
        workflow = (
            WorkflowBuilder()
            .add_edge(ui_gen, anim_enhancer)
            .add_edge(anim_enhancer, validator)
            .set_start_executor(ui_gen)
            .build()
        )

        # Run workflow
        async for event in workflow.run_stream(prompt):
            if isinstance(event, WorkflowOutputEvent):
                return event.data

        return "Error: No output generated"

if __name__ == "__main__":
    import sys
    # Read prompt from stdin
    prompt = sys.stdin.read().strip()
    if not prompt:
        print("Error: No prompt provided", file=sys.stderr)
        sys.exit(1)

    result = asyncio.run(generate_ui_component(prompt))
    print(result)