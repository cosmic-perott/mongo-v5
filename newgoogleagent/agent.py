from google.adk.agents import LlmAgent
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context

source_finder_google_search_agent = LlmAgent(
  name='Source_Finder_google_search_agent',
  model='gemini-2.5-flash',
  description=(
      'Agent specialized in performing Google searches.'
  ),
  sub_agents=[],
  instruction='Use the GoogleSearchTool to find information on the web.',
  tools=[
    GoogleSearchTool()
  ],
)
source_finder_url_context_agent = LlmAgent(
  name='Source_Finder_url_context_agent',
  model='gemini-2.5-flash',
  description=(
      'Agent specialized in fetching content from URLs.'
  ),
  sub_agents=[],
  instruction='Use the UrlContextTool to retrieve content from provided URLs.',
  tools=[
    url_context
  ],
)
source_finder = LlmAgent(
  name='source_finder',
  model='gemini-2.5-flash',
  description=(
      'find the sources of each activity and provide the links'
  ),
  sub_agents=[],
  instruction='',
  tools=[
    agent_tool.AgentTool(agent=source_finder_google_search_agent),
    agent_tool.AgentTool(agent=source_finder_url_context_agent)
  ],
)
planner_agent_google_search_agent = LlmAgent(
  name='Planner_Agent_google_search_agent',
  model='gemini-3.5-flash',
  description=(
      'Agent specialized in performing Google searches.'
  ),
  sub_agents=[],
  instruction='Use the GoogleSearchTool to find information on the web.',
  tools=[
    GoogleSearchTool()
  ],
)
planner_agent_url_context_agent = LlmAgent(
  name='Planner_Agent_url_context_agent',
  model='gemini-3.5-flash',
  description=(
      'Agent specialized in fetching content from URLs.'
  ),
  sub_agents=[],
  instruction='Use the UrlContextTool to retrieve content from provided URLs.',
  tools=[
    url_context
  ],
)
root_agent = LlmAgent(
  name='Planner_Agent',
  model='gemini-3.5-flash',
  description=(
      'your job is to make a schedule based on the user\'s requirements such as dates, number of people etc. and build a schedule using the list of attractions/hotels/restaurant that the user wants'
  ),
  sub_agents=[source_finder],
  instruction='when i give you a list of attractions/hotels/restaurant\nand my requirements,\npick ONE hotel\npick which attractions/restaurant i should go to on which date specifically\nreturn in this JSON file format\n{\ndate: dd/mm/yy\n//add as many attractions that you want for each day—number should be realistic\n{\nattraction name: name\nattraction time: not specific time but a good idea of when (e.g 1pm)\nattraction description: a short description of what the attraction is about\n}\n//add as many restaurant that you want for each day—number should be realistic\n{\nrestaurant name: name\nrestaurant time: not specific time but a good idea of when (e.g 1pm)\nfood description: a short description the restaurant\n}\n}\nmake it realistic so that if i could actually follow this schedule. leave at least a 1~3hr gap between   each activity',
  tools=[
    agent_tool.AgentTool(agent=planner_agent_google_search_agent),
    agent_tool.AgentTool(agent=planner_agent_url_context_agent)
  ],
)


root_agent = LlmAgent(
  name='Planner_Agent',
  model='gemini-3.5-flash',
  description=(
      'your job is to make a schedule based on the user\'s requirements such as dates, number of people etc. and build a schedule using the list of attractions/hotels/restaurant that the user wants'
  ),
  sub_agents=[source_finder],
  instruction='when i give you a list of attractions/hotels/restaurant\nand my requirements,\npick ONE hotel\npick which attractions/restaurant i should go to on which date specifically\nreturn in this JSON file format\n{\ndate: dd/mm/yy\n//add as many attractions that you want for each day—number should be realistic\n{\nattraction name: name\nattraction time: not specific time but a good idea of when (e.g 1pm)\nattraction description: a short description of what the attraction is about\n}\n//add as many restaurant that you want for each day—number should be realistic\n{\nrestaurant name: name\nrestaurant time: not specific time but a good idea of when (e.g 1pm)\nfood description: a short description the restaurant\n}\n}\nmake it realistic so that if i could actually follow this schedule. leave at least a 1~3hr gap between   each activity',
  tools=[
    agent_tool.AgentTool(agent=planner_agent_google_search_agent),
    agent_tool.AgentTool(agent=planner_agent_url_context_agent)
  ],
)


